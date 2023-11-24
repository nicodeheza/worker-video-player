import VideoWorker from './video.worker?worker'

const videoURL = '/loopTest.mp4'
const Xnum = 3
const Ynum = 3
const originalW = 720
const originalH = 486
const canvasW = originalW * 2
const canvasH = originalH * 2
const videoW = canvasW / Xnum
const videoH = canvasH / Ynum

const videosWorkers = new Array(Xnum * Ynum).fill(true).map(() => new VideoWorker())

videosWorkers.forEach((worker) => {
	worker.postMessage({url: videoURL})
	worker.onerror = (e) => console.error(e)
})

self.onmessage = async (event) => {
	if (event.data.view) {
		const canvas = event.data.view
		canvas.width = canvasW
		canvas.height = canvasH
		const ctx = canvas.getContext('2d')

		videosWorkers.forEach((worker, i) => {
			worker.onmessage = async (event) => {
				if (event.data.frame) {
					const x = (i % Xnum) * videoW
					const y = Math.floor(i / Xnum) * videoH
					ctx.drawImage(event.data.frame, x, y, videoW, videoH)
					event.data.frame.close()
				}
			}
		})
	}
}
export {}
