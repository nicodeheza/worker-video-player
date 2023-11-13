import {Info} from 'mp4box'
import Decoder from '../decoder'
import FrameQueue from './FrameQueue'

class Player {
	private frameQueue
	private baseTime = 0
	private pauseTime = 0
	private pendingFrame?: VideoFrame
	private underflow = true
	private isPlaying = true
	private decoder: Decoder
	private canRestart = false
	loop: boolean | undefined
	info?: Info

	constructor(uri: string, loop?: boolean) {
		this.loop = loop
		this.frameQueue = new FrameQueue()

		this.decoder = new Decoder(uri, loop)
		this.decoder.onFrame = (frame) => {
			if (!frame) return
			this.frameQueue.enqueue(frame)
			if (this.underflow) setTimeout(() => this.handleFrame(), 0)
		}

		this.decoder.onInfoReady = (info) => {
			this.info = info
		}
	}

	onFrame(frame: VideoFrame) {}

	private calculateTimeUntilNextFrame(timestamp: number) {
		if (this.baseTime === 0) this.baseTime = performance.now()
		const mediaTime = performance.now() - this.baseTime
		return Math.max(0, timestamp / 1000 - mediaTime)
	}

	private async handleFrame() {
		if (!this.isPlaying) return
		this.underflow = this.frameQueue.length === 0

		if (this.underflow) {
			this.pendingFrame?.close()
			this.pendingFrame = undefined

			if (this.canRestart && this.loop) {
				this.canRestart = false
				await this.decoder.restart()
				this.baseTime = performance.now()
			}

			return
		}

		const frame = this.frameQueue.dequeue()
		const timeUntilNextFrame = this.calculateTimeUntilNextFrame(frame?.timestamp || 0)
		await new Promise((r) => {
			setTimeout(r, timeUntilNextFrame)
		})

		if (frame) {
			this.onFrame(frame)
		}
		this.pendingFrame?.close()
		this.pendingFrame = frame || undefined

		if (!this.canRestart && this.loop) {
			this.canRestart = true
		}

		setTimeout(() => this.handleFrame(), 0)
	}

	play() {
		if (this.isPlaying) return
		this.isPlaying = true
		this.baseTime += performance.now() - this.pauseTime
		setTimeout(() => this.handleFrame(), 0)
	}

	//TODO - stop
	pause() {
		if (!this.isPlaying) return
		this.isPlaying = false
		this.pauseTime = performance.now()
	}
}

export default Player
