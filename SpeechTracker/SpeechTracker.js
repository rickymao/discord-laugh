const { EventEmitter } = require('events');

class SpeechTracker {
    
    speechEventEmitter = new EventEmitter();

    constructor(initialState={}) {
        this.map = initialState;
        this.speechEventEmitter.on('speak', this.handleSpeakEvent);
    }

    isAllUsersNotSpeaking = () => {
        const values = Object.values(this.map);
        for (const value of values) {
            if (value) {
                return false;
            }
        }
        return true;
    }

    handleSpeakEvent = (speakerId, isSpeaking, action) => {
        this.map[speakerId] = isSpeaking;
        action();
    };

    emit = (event, speakerId, isSpeaking, action) => {
        this.speechEventEmitter.emit(event, speakerId, isSpeaking, action);
    };
}

module.exports = SpeechTracker;