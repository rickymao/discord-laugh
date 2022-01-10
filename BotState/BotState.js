class BotState {

	constructor() {
		this.isLaughPlaying = false;
		this.isCheeringPlaying = false;
		this.isBooingPlaying = false;
	}

	setLaughState(newState) {this.isLaughPlaying = newState;}
	setCheerState(newState) {this.isCheeringPlaying = newState;}
	setBooState(newState) {this.isBooingPlaying = newState;}
}

module.exports = BotState;