class BotTracker {
	constructor() {
		this.map = {};
	}
	addToTracker(guildId, botState) {
		this.map[guildId] = botState;
	}
	getState(guildId) {
		return this.map[guildId];
	}
}

module.exports = BotTracker;