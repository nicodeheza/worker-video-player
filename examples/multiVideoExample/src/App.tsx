import {useEffect, useRef, useState} from 'react'
import './App.css'
import Worker from './worker/main.worker?worker'

function App() {
	const [worker, setWorker] = useState<Worker>()
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		if (!worker) {
			setWorker(new Worker())
		} else if (canvasRef.current) {
			const view = canvasRef.current.transferControlToOffscreen()
			worker.postMessage({view}, [view])
		}
	}, [worker])

	return <>{worker && <canvas ref={canvasRef} />}</>
}

export default App
