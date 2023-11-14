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

	function pause() {
		worker?.postMessage({state: 'pause'})
	}

	function play() {
		worker?.postMessage({state: 'play'})
	}

	function stop() {
		worker?.postMessage({state: 'stop'})
	}

	return (
		<>
			{worker && <canvas ref={canvasRef} />}
			<div>
				<button onClick={play}>Play</button>
				<button onClick={pause}>Pause</button>
				<button onClick={stop}>Stop</button>
			</div>
		</>
	)
}

export default App
