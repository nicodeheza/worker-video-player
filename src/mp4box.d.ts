declare module 'mp4box' {
	export function createFile(): ISOFile

	export interface Config {
		codec: string
		codedHeight: number
		codedWidth: number
		description: Uint8Array
	}

	export interface Track {
		id: number
		created: string
		modified: string
		movie_duration: number
		layer: number
		alternate_group: number
		movie_timescale: number
		volume: number
		track_width: number
		track_height: number
		timescale: number
		duration: number
		bitrate: number
		codec: string
		video: {
			width: number
			height: number
		}
		language: string
		nb_samples: number
	}

	export interface Info {
		duration: number
		timescale: number
		isFragmented: boolean
		isProgressive: boolean
		hasIOD: boolean
		brands: string[]
		created: string
		modified: string
		tracks: Track[]
		videoTracks: Track[]
	}

	export interface Sample {
		is_sync: boolean
		cts: number
		timescale: number
		duration: number
		data: BufferSource
	}

	export interface ISOFile {
		stream: {buffers: any[]; bufferIndex: number}
		boxes: any[]
		mdats: any[]
		moofs: any[]
		isProgressive: boolean
		moovStartFound: boolean
		onMoovStart: () => void | null
		moovStartSent: boolean
		onReady: (info: Info) => void | null
		readySent: boolean
		onSegment: (
			id: string | number,
			user: string,
			buffer: Buffer,
			sampleNumber: number,
			last: unknown
		) => void | null
		onSamples: (id: number, user: string, samples: Sample[]) => void | null
		onError: (e: any) => void | null
		sampleListBuilt: boolean
		fragmentedTracks: any[]
		extractedTracks: any[]
		isFragmentationInitialized: boolean
		sampleProcessingStarted: boolean
		nextMoofNumber: number
		itemListBuilt: boolean
		onSidx: () => void | null
		sidxSent: boolean
		discardMdatData: boolean
		appendBuffer: (buffer: MP4ArrayBuffer) => void
		flush: () => void
		getTrackById: (id: number) => Trak
		setExtractionOptions: (trackId: number) => void
		start: () => void
		stop: () => void
	}

	export interface MP4ArrayBuffer extends ArrayBuffer {
		fileStart: number
	}

	export class DataStream {
		static BIG_ENDIAN: boolean
		static LITTLE_ENDIAN: boolean
		buffer: ArrayBuffer
		constructor(
			arrayBuffer: ArrayBuffer | undefined,
			byteOffset: number,
			endianness: boolean
		)
		// TODO: Complete interface
	}

	interface Entry {
		write: (stream: DataStream) => void
	}

	export interface Trak {
		mdia: {
			minf: {
				stbl: {
					stsd: {
						entries: {
							avcC?: Entry
							hvcC?: Entry
							vpcC?: Entry
							av1C?: Entry
						}[]
					}
				}
			}
		}
		// TODO: Complete interface
	}
}
