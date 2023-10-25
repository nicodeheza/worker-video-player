import Player from '../../../src/index'

const w = 600
const h = 600

const player = new Player(
	'https://w3c.github.io/webcodecs/samples/data/bbb_video_avc_frag.mp4',
	true
)
self.onmessage = async (event) => {
	if (event.data.view) {
		const canvas = event.data.view
		canvas.width = w
		canvas.height = h
		const ctx = canvas.getContext('2d')
		player.onFrame = (frame) => {
			ctx.drawImage(frame, 0, 0, w, h)
		}
	}

	if (event.data.state) {
		const {state} = event.data
		const actions: Record<string, () => void> = {
			play() {
				player.play()
			},
			pause() {
				player.pause()
			}
		}
		actions[state]()
	}
}
export {}
