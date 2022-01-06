class AppState {
    isLaughPlaying = false;
    isCheeringPlaying = false;
    isBooingPlaying = false;
    currentChannelID = null;

    constructor() { }

    setLaughState = (newState) => this.isLaughPlaying = newState;
    setCheerState = (newState) => this.isCheeringPlaying = newState;
    setBooState = (newState) => this.isBooingPlaying = newState;
    setCurrentChannel = (newChannelID) => this.currentChannelID = newChannelID;
}

module.exports = AppState;