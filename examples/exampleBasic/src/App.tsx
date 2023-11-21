import {ChangeEvent, useEffect, useRef, useState} from 'react'
import './App.css'
import Worker from './worker/main.worker?worker'

function App() {
	const [worker, setWorker] = useState<Worker>()
	const [speed, setSpeed] = useState(1)
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

	function onSpeedChange(e: ChangeEvent<HTMLInputElement>) {
		const newValue = Number(e.target.value)
		setSpeed(newValue)
		worker?.postMessage({state: 'speedChange', payload: {value: newValue}})
	}

	return (
		<>
			{worker && <canvas ref={canvasRef} />}
			<div>
				<button onClick={play}>Play</button>
				<button onClick={pause}>Pause</button>
				<button onClick={stop}>Stop</button>
				<input
					type="range"
					min={0.25}
					max={2}
					step={0.25}
					value={speed}
					onChange={onSpeedChange}
				/>
			</div>
		</>
	)
}

export default App
