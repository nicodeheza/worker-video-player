import {Info} from 'mp4box'
import {MP4Demuxer} from '../demuxer'

class Decoder {
	private cache: EncodedVideoChunk[] = []
	private decoder: VideoDecoder

	constructor(uri: string, loop?: boolean) {
		this.decoder = new VideoDecoder({
			output: (frame) => {
				this.onFrame(frame)
			},
			error: (e) => {
				console.error(e)
			}
		})

		const demuxer = new MP4Demuxer(uri, {
			onConfig: (config) => {
				this.decoder.configure(config)
			},
			onChunk: (chunk) => {
				if (loop) {
					this.cache.push(chunk)
				}
				this.decoder.decode(chunk)
			}
		})

		demuxer.onInfoReady = (info) => {
			this.onInfoReady(info)
		}
	}

	onInfoReady(info: Info) {}
	onFrame(frame: VideoFrame | null) {}
	restart() {
		if (this.cache.length === 0) return
		console.log('in restart')
		this.cache.forEach((chunk) => {
			this.decoder.decode(chunk)
		})
	}
}

export default Decoder
