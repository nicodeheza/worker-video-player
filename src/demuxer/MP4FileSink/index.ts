import {ISOFile, MP4ArrayBuffer} from 'mp4box'

// https://w3c.github.io/webcodecs/samples/video-decode-display/

export class MP4FileSink {
	private file: ISOFile
	private offset = 0

	constructor(file: ISOFile) {
		this.file = file
	}

	write(chunk: Uint8Array) {
		const buffer = new ArrayBuffer(chunk.byteLength) as MP4ArrayBuffer
		new Uint8Array(buffer).set(chunk)

		buffer.fileStart = this.offset
		this.offset += buffer.byteLength

		this.file.appendBuffer(buffer)
	}

	close() {
		this.file.flush()
	}
}
