import Player from '../../../../src/index'

// const player = new Player(
// 	'https://w3c.github.io/webcodecs/samples/data/bbb_video_avc_frag.mp4',
// 	{autoPlay: true, loop: true}
// )
// const player = new Player('../../public/test.mp4', {autoPlay: true})
const player = new Player('../../public/loopTest.mp4', {loop: true, autoPlay: true})
self.onmessage = async (event) => {
	if (event.data.view) {
		const canvas = event.data.view
		// canvas.width = w
		// canvas.height = h
		const ctx = canvas.getContext('2d')
		player.onFrame = (frame) => {
			canvas.width = frame.displayWidth
			canvas.height = frame.displayHeight
			ctx.drawImage(frame, 0, 0, frame.displayWidth, frame.displayHeight)
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
			},
			stop() {
				player.stop()
			},
			speedChange() {
				// console.log(event.data.payload.value)
				player.speed = event.data.payload.value
			}
		}
		actions[state]()
	}
}
export {}
