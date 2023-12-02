import Player from '../../../../src/index'

// const player = new Player(
// 	'https://w3c.github.io/webcodecs/samples/data/bbb_video_avc_frag.mp4',
// 	{autoPlay: true, loop: true}
// )
// const player = new Player('../../public/loopTest.json', {loop: true, autoPlay: true})
const player = new Player('../../public/loopTestBox.json', {loop: true, autoPlay: true})
self.onmessage = async (event) => {
	if (event.data.view) {
		const canvas = event.data.view
		// canvas.width = w
		// canvas.height = h
		const ctx = canvas.getContext('2d')
		player.onFrame = ([data, image]) => {
			canvas.width = data.width
			canvas.height = data.height

			ctx.drawImage(image, 0, 0, data.width, data.height)
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
