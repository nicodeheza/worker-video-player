interface FrameNode {
	frame: VideoFrame
	next: FrameNode | null
}

class FrameQueue {
	private head: FrameNode | null
	private tail: FrameNode | null

	length: number

	constructor() {
		this.head = null
		this.tail = null

		this.length = 0
	}

	enqueue(frame: VideoFrame) {
		const node = {frame, next: null}
		if (!this.head || !this.tail) {
			this.head = node
			this.tail = node
		} else {
			this.tail.next = node
			this.tail = this.tail.next
		}

		this.length++
	}

	dequeue() {
		if (!this.head) return null
		const {frame} = this.head
		this.head = this.head.next

		this.length--

		if (this.length === 0) this.tail = null

		return frame
	}
}

export default FrameQueue
