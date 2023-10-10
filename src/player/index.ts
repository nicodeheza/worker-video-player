import Decoder from '../decoder'
import FrameQueue from './FrameQueue'

class Player {
	private frameQueue
	private baseTime = 0
	private pendingFrame?: VideoFrame
	private underflow = true

	constructor(uri: string, verbose?: boolean) {
		this.frameQueue = new FrameQueue()

		const decoder = new Decoder(uri, verbose)
		decoder.onFrame = (frame) => {
			if (!frame) return
			this.frameQueue.enqueue(frame)
			if (this.underflow) setTimeout(() => this.handleFrame(), 0)
		}
	}

	onFrame(frame: VideoFrame) {}

	private calculateTimeUntilNextFrame(timestamp: number) {
		if (this.baseTime === 0) this.baseTime = performance.now()
		const mediaTime = performance.now() - this.baseTime
		return Math.max(0, timestamp / 1000 - mediaTime)
	}

	private async handleFrame() {
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
		}
		setTimeout(() => this.handleFrame(), 0)
	}

	play() {
		this.handleFrame()
	}
}

export default Player
