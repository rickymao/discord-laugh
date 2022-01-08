class AppState {

	constructor() {
		this.isLaughPlaying = false;
		this.isCheeringPlaying = false;
		this.isBooingPlaying = false;
		this.currentChannelID = null;
	}

	setLaughState(newState) {this.isLaughPlaying = newState;}
	setCheerState(newState) {this.isCheeringPlaying = newState;}
	setBooState(newState) {this.isBooingPlaying = newState;}
	setCurrentChannel(newChannelID) {this.currentChannelID = newChannelID;}
}

module.exports = AppState;