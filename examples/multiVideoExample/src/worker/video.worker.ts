import Player from '../../../../src'

self.onmessage = async (event) => {
	if (event.data.url) {
		const video = new Player(event.data.url, {autoPlay: true, loop: true})
		video.onFrame = (frame) => {
			const worker = self as unknown as Worker
			worker.postMessage({frame}, [frame])
		}
	}
}
export {}
