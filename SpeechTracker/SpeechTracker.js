const { EventEmitter } = require('events');

class SpeechTracker {

	constructor() {
		this.speechEventEmitter = new EventEmitter();
		this.map = {};
		this.speechEventEmitter.on('speak', (speakerId, isSpeaking, action) => {
			this.handleSpeakEvent(speakerId, isSpeaking, action);
		});
		this.handleSpeakEvent.bind(this);
	}

	isAllUsersNotSpeaking() {
		const values = Object.values(this.map);
		for (const value of values) {
			if (value) {
				return false;
			}
		}
		return true;
	}

	handleSpeakEvent(speakerId, isSpeaking, action) {
		this.map[speakerId] = isSpeaking;
		action();
	}

	emit(event, speakerId, isSpeaking, action) {
		this.speechEventEmitter.emit(event, speakerId, isSpeaking, action);
	}
}

module.exports = SpeechTracker;