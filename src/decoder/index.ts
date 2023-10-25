import {MP4Demuxer} from '../demuxer'

class Decoder {
	private decoder: VideoDecoder
	private isReady = false

	constructor(uri: string, verbose?: boolean) {
		this.decoder = new VideoDecoder({
			output: (frame) => {
				this.onFrame(frame)
			},
			error: (e) => {
				console.error(e)
			}
		})

		new MP4Demuxer(uri, {
			onConfig: (config) => {
				this.decoder.configure(config)
			},
			onChunk: (chunk) => {
				this.decoder.decode(chunk)
			}
		})
	}

	onFrame(frame: VideoFrame | null) {}

	waitReady() {
		return new Promise((resolve) => {
			while (!this.isReady) {}
			resolve(true)
		})
	}
}

export default Decoder
