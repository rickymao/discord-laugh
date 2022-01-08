class SoundQueue {

	constructor(initialState = []) {
		this.queue = initialState;
	}

	addToQueue(sound) { this.queue.push(sound); }
	clearQueue() {
		for (const laughID of this.queue) {
			clearTimeout(laughID);
		}
	}
}

module.exports = SoundQueue;