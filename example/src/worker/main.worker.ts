import Player from '../../../src/index'

const w = 600
const h = 600

self.onmessage = async (event) => {
	console.log(event)
	if (event.data.view) {
		const player = new Player(
			'https://w3c.github.io/webcodecs/samples/data/bbb_video_avc_frag.mp4',
			true
		)
		const canvas = event.data.view
		canvas.width = w
		canvas.height = h
		const ctx = canvas.getContext('2d')
		player.onFrame = (frame) => {
			ctx.drawImage(frame, 0, 0, w, h)
			frame?.close()
		}
	}
}
export {}
