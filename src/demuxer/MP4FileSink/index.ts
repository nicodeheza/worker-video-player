import {ISOFile, MP4ArrayBuffer} from 'mp4box'
import {SetStatus} from '../../types'

// https://w3c.github.io/webcodecs/samples/video-decode-display/

export class MP4FileSink {
	private setStatus: SetStatus
	private file: ISOFile
	private offset = 0

	constructor(file: ISOFile, setStatus: SetStatus) {
		this.file = file
		this.setStatus = setStatus
	}

	write(chunk: Uint8Array) {
		const buffer = new ArrayBuffer(chunk.byteLength) as MP4ArrayBuffer
		new Uint8Array(buffer).set(chunk)

		buffer.fileStart = this.offset
		this.offset += buffer.byteLength

		this.setStatus('fetch', (this.offset / 1024 ** 2).toFixed(1) + 'MiB')
		this.file.appendBuffer(buffer)
	}

	close() {
		this.setStatus('fetch', 'Done')
		this.file.flush()
	}
}
