import Player from '../../../../src/index'

// const player = new Player(
// 	'https://w3c.github.io/webcodecs/samples/data/bbb_video_avc_frag.mp4',
// 	{autoPlay: true, loop: true}
// )
// const player = new Player('../../public/test.mp4', {autoPlay: true})
// const player = new Player('../../public/loopTest.mp4', {loop: true, autoPlay: true})
const Xnum = 3
const Ynum = 3
const originalW = 720
const originalH = 486
const canvasW = originalW * 2
const canvasH = originalH * 2
const videoW = canvasW / Xnum
const videoH = canvasH / Ynum

const videos = new Array(Xnum * Ynum)
	.fill(true)
	.map(() => new Player('../../public/loopTest.mp4', {loop: true, autoPlay: true}))

self.onmessage = async (event) => {
	if (event.data.view) {
		const canvas = event.data.view
		canvas.width = canvasW
		canvas.height = canvasH
		const ctx = canvas.getContext('2d')

		videos.forEach((video, i) => {
			video.onFrame = (frame) => {
				const x = (i % Ynum) * videoW
				const y = (i / Ynum) * videoH - videoH
				ctx.drawImage(frame, x, y, videoW, videoH)
			}
		})
	}
}
export {}
