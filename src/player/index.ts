import {Info} from 'mp4box'
import Decoder from '../decoder'
import FrameQueue from './FrameQueue'

interface Options {
	loop?: boolean
	autoPlay?: boolean
}

class Player {
	private frameQueue
	private baseTime = 0
	private pauseTime = 0
	private pendingFrame?: VideoFrame
	private underflow = true
	private decoder: Decoder
	private canRestart = false
	private totalFrames = -1
	private _isPlaying = true
	private _isStop = false
	private _frameCount = 0
	private _info?: Info
	loop: boolean | undefined
	speed = 1

	constructor(uri: string, options?: Options) {
		const autoPlay = options?.autoPlay || false
		this.loop = options?.loop || false
		this.frameQueue = new FrameQueue()

		this.decoder = new Decoder(uri, this.loop)
		this.decoder.onFrame = (frame) => {
			if (!frame) return
			this.frameQueue.enqueue(frame)
			if (this.underflow) setTimeout(() => this.handleFrame(), 0)
		}

		this.decoder.onInfoReady = (info) => {
			this._info = info
			this.totalFrames = info.tracks[0].nb_samples - 2
		}

		if (!autoPlay) {
			this.pause()
		}
	}

	onFrame(frame: VideoFrame) {}

	private calculateTimeUntilNextFrame(timestamp: number) {
		if (this.baseTime === 0) this.baseTime = performance.now()
		const mediaTime = performance.now() - this.baseTime
		return Math.max(0, timestamp / 1000 / this.speed - mediaTime)
	}

	private async handleFrame() {
		if (!this._isPlaying) return
		this.underflow = this.frameQueue.length === 0

		if (this.underflow) {
			this.pendingFrame?.close()
			this.pendingFrame = undefined

			if (this.canRestart) {
				if (this.loop) {
					this.onRestart()
				} else {
					this._isPlaying = false
				}
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
			this._frameCount += 1
		}
		this.pendingFrame?.close()
		this.pendingFrame = frame || undefined

		if (this.totalFrames === this._frameCount) {
			this.canRestart = true
		}
		setTimeout(() => this.handleFrame(), 0)
	}

	private onRestart() {
		this.canRestart = false
		this.decoder.restart()
		this.baseTime = performance.now()
		this._frameCount = 0
	}

	play() {
		if (this._isPlaying) return

		this._isPlaying = true
		this._isStop = false

		if (this.canRestart) {
			this.onRestart()
			return
		}

		this.baseTime += performance.now() - this.pauseTime
		setTimeout(() => this.handleFrame(), 0)
	}

	pause() {
		if (!this._isPlaying) return
		this._isPlaying = false
		this.pauseTime = performance.now()
	}

	stop() {
		if (this._isStop || !this._info) return
		this.play()
		this._isStop = true
		while (this.frameQueue.length > 0) {
			const frame = this.frameQueue.dequeue()
			frame?.close()
		}

		this.onRestart()

		const trakData = this._info.tracks[0]
		const {nb_samples, movie_duration, movie_timescale} = trakData
		const fps = nb_samples / (movie_duration / movie_timescale)

		setTimeout(() => this.pause(), (1000 / fps) * 2)
	}

	get info() {
		return this._info
	}

	get isPlaying() {
		return this._isPlaying
	}

	get isStop() {
		return this._isStop
	}

	get frameCount() {
		return this._frameCount
	}
}

export default Player
