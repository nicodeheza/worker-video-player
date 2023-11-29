import {Config} from 'mp4box'

export type SetStatus = (type: string, message: string) => void
export type OnConfig = (config: Config) => void
export type OnChunk = (chunk: EncodedVideoChunk) => void
export interface FrameData {
	width: number
	height: number
	timestamp: number
}
export type EncodedImage = string
export type _Frame = [FrameData, EncodedImage]
export type Frame = [FrameData, ImageBitmap]
