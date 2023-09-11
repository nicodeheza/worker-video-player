const w = 600
const h = 600

self.onmessage = async (event) => {
	console.log(event)
	if (event.data.view) {
		const canvas = event.data.view
		canvas.width = w
		canvas.height = h
		// const ctx = canvas.getContext('2d')
	}
}
export {}
