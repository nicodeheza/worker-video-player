import {Info} from 'mp4box'
import {Frame, _Frame} from '../types'

interface Options {
	loop?: boolean
	autoPlay?: boolean
}

// do encoder

class Player {
	private frames?: _Frame[]
	private baseTime = 0
	private pauseTime = 0
	private underflow = true
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

		fetch(uri)
			.then((data) => data.json())
			.then((frames) => {
				this.frames = frames
				this.totalFrames = frames.length
				setTimeout(() => this.handleFrame(), 0)
			})

		if (!autoPlay) {
			this.pause()
		}
	}

	onFrame(frame: Frame) {}

	private calculateTimeUntilNextFrame(timestamp: number) {
		if (this.baseTime === 0) this.baseTime = performance.now()
		const mediaTime = performance.now() - this.baseTime
		return Math.max(0, timestamp / this.speed - mediaTime)
	}

	private async handleFrame() {
		if (!this._isPlaying || !this.frames) return
		this.underflow = this.frameCount === this.totalFrames

		if (this.underflow) {
			this.canRestart = true
			if (this.loop) {
				this.onRestart()
			} else {
				this._isPlaying = false
			}
		}

		const frame = this.frames[this.frameCount]
		const image = await fetch(frame[1])
			.then((data) => data.blob())
			.then((blob) => createImageBitmap(blob))

		const timeUntilNextFrame = this.calculateTimeUntilNextFrame(frame[0].timestamp)
		await new Promise((r) => {
			setTimeout(r, timeUntilNextFrame)
		})

		this._frameCount += 1
		this.onFrame([frame[0], image])

		if (this.totalFrames === this._frameCount) {
			this.canRestart = true
		}
		setTimeout(() => this.handleFrame(), 0)
	}

	private onRestart() {
		this.canRestart = false
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
