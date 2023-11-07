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
	private canRestart = true
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

		this.decoder.onInfoReady = (info) => {
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
		if (this.underflow) {
			this.pendingFrame?.close()
			return
		}
		const frame = this.frameQueue.dequeue()
		const timeUntilNextFrame = this.calculateTimeUntilNextFrame(frame?.timestamp || 0)
		await new Promise((r) => {
			setTimeout(r, timeUntilNextFrame)
		})

		if (frame) {
			this.onFrame(frame)
			this.pendingFrame?.close()
			this.pendingFrame = frame as VideoFrame

			const timestamp = frame.timestamp / 1000
			if (
				this.loop &&
				this.canRestart &&
				this.duration &&
				timestamp > this.duration / 2
			) {
				console.log('restart')
				this.decoder.restart()
				this.canRestart = false
			}
			if (this.duration && timestamp >= this.duration) {
				console.log('end')
				//FIXME
				this.baseTime = performance.now()
				this.canRestart = true
			}
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
