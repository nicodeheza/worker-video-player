import {DataStream, ISOFile, Info, Sample, Track, createFile} from 'mp4box'
import {OnChunk, OnConfig} from '../types'
import {MP4FileSink} from './MP4FileSink'

// https://w3c.github.io/webcodecs/samples/video-decode-display/

interface InjectedFunctions {
	onConfig: OnConfig
	onChunk: OnChunk
}

export class MP4Demuxer {
	private onConfig: OnConfig
	private onChunk: OnChunk
	private file: ISOFile

	constructor(uri: string, {onConfig, onChunk}: InjectedFunctions) {
		this.onConfig = onConfig
		this.onChunk = onChunk

		this.file = createFile()
		this.file.onError = (error) => console.error('demux', error)
		this.file.onReady = this.onReady.bind(this)
		this.file.onSamples = this.onSamples.bind(this)

		const fileSink = new MP4FileSink(this.file)
		fetch(uri).then((response) => {
			response.body?.pipeTo(new WritableStream(fileSink, {highWaterMark: 2}))
		})
	}

	private description(track: Track) {
		const trak = this.file.getTrackById(track.id)
		for (const entry of trak.mdia.minf.stbl.stsd.entries) {
			const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C
			if (box) {
				const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN)
				box.write(stream)
				return new Uint8Array(stream.buffer, 8)
			}
		}
		throw new Error('avcC, hvcC, vpcC, or av1C box not found')
	}

	private onReady(info: Info) {
		this.onInfoReady(info)
		const track = info.videoTracks[0]

		this.onConfig({
			codec: track.codec.startsWith('vp08') ? 'vp8' : track.codec,
			codedHeight: track.video.height,
			codedWidth: track.video.width,
			description: this.description(track)
		})

		this.file.setExtractionOptions(track.id)
		this.file.start()
	}

	onInfoReady(info: Info) {}

	private onSamples(track_id: number, ref: string, samples: Sample[]) {
		for (const sample of samples) {
			this.onChunk(
				new EncodedVideoChunk({
					type: sample.is_sync ? 'key' : 'delta',
					timestamp: (1e6 * sample.cts) / sample.timescale,
					duration: (1e6 * sample.duration) / sample.timescale,
					data: sample.data
				})
			)
		}
	}
}
