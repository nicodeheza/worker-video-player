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

	duration: number | undefined

	constructor(uri: string, loop?: boolean) {
		this.loop = loop
		this.frameQueue = new FrameQueue()

		this.decoder = new Decoder(uri, loop)
		this.decoder.onFrame = (frame) => {
			if (!frame) return
			this.frameQueue.enqueue(frame)
			if (this.underflow) setTimeout(() => this.handleFrame(), 0)
		}

		//TODO - check remove
		this.decoder.onInfoReady = (info) => {
			// console.log(info)
			this.duration = info.duration
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

		console.log('frame length:', this.frameQueue.length)

		if (this.underflow) {
			this.pendingFrame?.close()
			this.pendingFrame = undefined

			if (this.canRestart && this.loop) {
				this.canRestart = false
				console.log('>>>>>restart')
				await this.decoder.restart()
				this.baseTime = performance.now()
				// console.log('pending:', this.pendingFrame)
			}

			return
		}

		const frame = this.frameQueue.dequeue()
		const timeUntilNextFrame = this.calculateTimeUntilNextFrame(frame?.timestamp || 0)
		await new Promise((r) => {
			setTimeout(r, timeUntilNextFrame)
		})

		const currentTime = (frame?.timestamp ?? 0) / 1000
		if (frame) {
			this.onFrame(frame)
		}
		this.pendingFrame?.close()
		this.pendingFrame = frame || undefined

		// console.log(currentTime, '-', this.duration)
		if (!this.canRestart && this.loop && currentTime >= this.duration!) {
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

	//TODO - loop
	//TODO - stop
	pause() {
		if (!this.isPlaying) return
		this.isPlaying = false
		this.pauseTime = performance.now()
	}
}

export default Player
