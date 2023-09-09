import {Config} from 'mp4box'

export type SetStatus = (type: string, message: string) => void
export type OnConfig = (config: Config) => void
export type OnChunk = (chunk: EncodedVideoChunk) => void
