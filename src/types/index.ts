import {Config} from 'mp4box'

export type SetStatus = (type: string, message: string) => void
export type OnConfig = (config: Config) => void
export type OnChunk = (chunk: EncodedVideoChunk) => void
export interface _Frame {
	time: number
	image: string
}
export interface Frame extends Omit<_Frame, 'image'> {
	image: ImageBitmap
}
