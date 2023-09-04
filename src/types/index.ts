export type SetStatus = (type: string, message: string) => void

export interface ISOFile {
	stream: {buffers: any[]; bufferIndex: number}
	boxes: any[]
	mdats: any[]
	moofs: any[]
	isProgressive: boolean
	moovStartFound: boolean
	onMoovStart: () => void | null
	moovStartSent: boolean
	onReady: (info: any) => void | null
	readySent: boolean
	onSegment: (
		id: string | number,
		user: string,
		buffer: Buffer,
		sampleNumber: number,
		last: unknown
	) => void | null
	onSamples: (id: string, user: string, samples: any[]) => void | null
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
}

export interface MP4ArrayBuffer extends ArrayBuffer {
	fileStart: number
}
