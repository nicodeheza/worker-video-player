import {Config, Info} from 'mp4box'
import {MP4Demuxer} from '../demuxer'

class Decoder {
	constructor(uri: string) {
		const decoder = new VideoDecoder({
			output: (frame) => {
				this.onFrame(frame)
			},
			error: (e) => {
				console.error(e)
			}
		})

		new MP4Demuxer(uri, {
			onConfig: (config) => {
				decoder.configure(config)
			},
			onChunk: (chunk) => {
				decoder.decode(chunk)
			}
		})
	}

	onFrame(frame: VideoFrame | null) {}
}

export default Decoder
