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

	function stop() {
		worker?.postMessage({state: 'pause'})
	}

	function play() {
		worker?.postMessage({state: 'play'})
	}

	return (
		<>
			{worker && <canvas ref={canvasRef} />}
			<div>
				<button onClick={play}>Play</button>
				<button onClick={stop}>Pause</button>
			</div>
		</>
	)
}

export default App
