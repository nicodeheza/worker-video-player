import {MP4Demuxer} from '../demuxer'

class Player {
	private verbose?: boolean
	private pendingStatus: Record<string, string> | null = null
	private startTime: number | null = null
	private pendingFrame: VideoFrame | null = null
	private frameCount = 0
	private decoder: VideoDecoder

	constructor(uri: string, verbose?: boolean) {
		this.verbose = verbose

		this.decoder = new VideoDecoder({
			output: (frame) => {
				if (this.startTime === null) {
					this.startTime = performance.now()
				} else {
					const elapsed = (performance.now() - this.startTime) / 1000
					const fps = ++this.frameCount / elapsed
					this.setStatus('render', `${fps.toFixed(0)} fps`)
				}

				this.handleFrame(frame)
			},
			error: (e) => {
				this.setStatus('decode', `${e}`)
			}
		})

		new MP4Demuxer(uri, {
			onConfig: (config) => {
				this.setStatus(
					'decode',
					`${config.codec} @ ${config.codedWidth}x${config.codedHeight}`
				)
				this.decoder.configure(config)
			},
			onChunk: (chunk) => {
				this.decoder.decode(chunk)
			},
			setStatus: this.setStatus
		})
	}

	onFrame(frame: VideoFrame | null) {}

	private handleFrame(frame: VideoFrame) {
		if (!this.pendingFrame) {
			requestAnimationFrame(() => this.sendFrame())
		} else {
			this.pendingFrame.close()
		}
		this.pendingFrame = frame
	}

	private sendFrame() {
		this.onFrame(this.pendingFrame)
		this.pendingFrame = null
	}

	private setStatus(type: string, message: string) {
		if (this.pendingStatus) {
			this.pendingStatus[type] = message
		} else {
			this.pendingStatus = {[type]: message}

			requestAnimationFrame(() => this.statusAnimationFrame())
		}
	}

	private statusAnimationFrame() {
		if (this.verbose) {
			console.log('Player Status:', this.pendingStatus)
		}

		this.pendingStatus = null
	}
}

export default Player
