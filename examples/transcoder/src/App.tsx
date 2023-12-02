import {useRef, ChangeEvent} from 'react'
import {Transcoder} from '../../../src/transcoder'

function App() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const anchorRef = useRef<HTMLAnchorElement>(null)

	function onFile(e: ChangeEvent<HTMLInputElement>) {
		const files = e.target.files
		if (!files || !canvasRef.current) return

		const url = URL.createObjectURL(files[0])
		const transcoder = new Transcoder(canvasRef.current)
		transcoder.transcode(url).then((json) => {
			const href = 'data:text/json;charset=utf-8,' + encodeURIComponent(json)
			anchorRef.current?.setAttribute('href', href)
			anchorRef.current?.setAttribute('download', `${files[0].name.split('.')[0]}.json`)
			anchorRef.current?.click()
		})
	}

	return (
		<>
			<canvas ref={canvasRef} />
			<input type="file" accept="video/mp4" onChange={onFile} />
			<a style={{display: 'none'}} ref={anchorRef} />
		</>
	)
}

export default App
