import Decoder from '../decoder'
import {_Frame} from '../types'

export class Transcoder {
	private frames: _Frame[] = []
	private canvas: HTMLCanvasElement
	private lastTimestamp = 0

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas
	}

	async transcode(url: string) {
		this.start(url)
		return this.result()
	}

	private start(url: string) {
		const decoder = new Decoder(url)

		const ctx = this.canvas.getContext('2d')

		const onReady = () => this.onResult(JSON.stringify(this.frames))
		let timeOut = setTimeout(onReady, 2000)

		decoder.onFrame = (frame) => {
			if (!frame) return
			clearTimeout(timeOut)
			const {displayWidth, displayHeight, timestamp} = frame

			this.canvas.width = displayWidth
			this.canvas.height = displayHeight

			ctx?.drawImage(frame, 0, 0, displayWidth, displayHeight)
			const image = this.canvas.toDataURL('image/webp')
			frame.close()

			const time = timestamp / 1000 - this.lastTimestamp
			// console.log(`${time} = ${timestamp} / 1000 - ${this.lastTime}`)
			this.lastTimestamp = timestamp / 1000

			this.frames.push({
				time,
				image
			})

			timeOut = setTimeout(onReady, 2000)
		}
	}

	private onResult(json: string) {}

	private async result() {
		return await new Promise<string>((r) => {
			this.onResult = (json) => {
				r(json)
			}
		})
	}
}
