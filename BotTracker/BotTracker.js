class BotTracker {
	constructor() {
		this.map = {};
	}
	addToTracker(guildId, botState) {
		this.map[guildId] = botState;
	}
}

module.exports = BotTracker;