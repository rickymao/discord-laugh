const { getRandomLaugh, getLaughResource } = require('./laughs');
const { getRandomCheer, getCheerResource } = require('./cheers');
const { getRandomBoo, getBooResource } = require('./boos');
const { Client, Intents } = require('discord.js');
const {
	AudioPlayerStatus,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	entersState,
	NoSubscriberBehavior,
	VoiceConnectionStatus,
	VoiceReceiver,
	EndBehaviorType,
	getVoiceConnection
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { join } = require('path');
const { createReadStream } = require('fs');
const { token, clientId } = require('./config/config.json');
const { EventEmitter } = require('events');

const usersSpeakingMap = {};
let laughQueue = [];
let isLaughPlaying = false;
let isCheeringPlaying = false;
let isBooingPlaying = false;
const usersSpeakingMapEmitter = new EventEmitter();
let currentChannelID = null;
let currentBotID


const clearLaughQueue = () => {
	for (const laughID of laughQueue) {
		clearTimeout(laughID);
	}
}
const isAllUsersNotSpeaking = () => {
	const values = Object.values(usersSpeakingMap);
	for (const value of values) {
		if (value) {
			return false;
		}
	}
	return true;
}

const handleSpeakEvent = (speakerId, isSpeaking, connection) => {
	usersSpeakingMap[speakerId] = isSpeaking;
	if (!isSpeaking) {
		laughQueue.push(setTimeout(() => {
			if (isAllUsersNotSpeaking() && !isLaughPlaying) {
				const player = createAudioPlayer();
				player.on(AudioPlayerStatus.Idle, () => {
					isLaughPlaying = false;
				});

				player.on(AudioPlayerStatus.AutoPaused, () => {
					isLaughPlaying = false;
				});

				player.on(AudioPlayerStatus.Playing, () => {
					isLaughPlaying = true;
				});				
				let resource = getLaughResource(getRandomLaugh());
				player.play(resource);
				connection.subscribe(player);
			}
		}, 1000));
	} else {
		clearLaughQueue();
	}

}

usersSpeakingMapEmitter.on('speak', handleSpeakEvent);


const isArrayMatch = (arr1, arr2) => {
	if (arr1.length !== arr2.length) {
		return false;
	}

	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) {
			return false;
		}
	}

	return true;
}

const client = new Client({ intents: ['GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILDS'] });
client.login(token);


client.once('ready', () => {
	try {
		console.log('Ready!');
	} catch (e) {
		console.log({ e });
	}

});

client.on('debug', console.log);
client.on('interactionCreate', async interaction => {

	if (!interaction.isCommand()) { return; }

	if (interaction.commandName === "track") {
		const channel = interaction.member.voice.channel;
		currentChannelID = channel.id;
		const connection = joinVoiceChannel({
			selfDeaf: false,
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator
		});
		const receiver = connection.receiver;

		// Get all user IDs in call
		const usersInCall = Array.from(channel.members.values());
		const userIDInCall = usersInCall.map((elem) => {
			return elem.user.id
		});

		// Get array of receive streams
		const userStreams = userIDInCall.map((id) => {
			const newObj = receiver.subscribe(id);
			newObj.id = id;
			return newObj;
		});
		// Listen to when they start and stop
		for (const stream of userStreams) {
			stream.on('data', (chunk) => {
				const chunkString = JSON.stringify(chunk);
				const chunkObj = JSON.parse(chunkString);
				if (isArrayMatch(chunkObj.data, [248, 255, 254])) {
					usersSpeakingMapEmitter.emit('speak', stream.id, false, connection);
				} else {
					usersSpeakingMapEmitter.emit('speak', stream.id, true, connection);
				}
			});
		}
	}

	if (interaction.commandName === "laugh") {
		const channel = interaction.member.voice.channel;
		const connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator
		});

		connection.on(VoiceConnectionStatus.Ready, () => {
			console.log('The connection has entered the Ready state - ready to play audio!');
		});
		const stream = ytdl('https://www.youtube.com/watch?v=5OSrxVXI8wo', { filter: 'audioonly' });
		const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
		const player = createAudioPlayer();
		
		player.play(resource);
		connection.subscribe(player);
				
		player.on(AudioPlayerStatus.Playing, () => {
			console.log('playing');
		});
		player.on(AudioPlayerStatus.Idle, () => {
			isLaughPlaying = false;
		});

	}
});

client.on('voiceStateUpdate', (oldState, newState) => {
	const connection = getVoiceConnection(newState.guild.id);
	console.log({ isCheeringPlaying, isLaughPlaying, isBooingPlaying });
	if (connection && 
		currentChannelID && 
		oldState.channelId !== currentChannelID &&
		newState.channelId === currentChannelID &&
		newState.id !== clientId) {
		let resource = getCheerResource(getRandomCheer());
		const player = createAudioPlayer();
		player.play(resource);
		console.log("CHEERING");
		isCheeringPlaying = true;

		player.on(AudioPlayerStatus.AutoPaused, () => {
			isCheeringPlaying = false;
		});
		
		connection.subscribe(player);
		
	} else if (connection && 
		currentChannelID && 
		oldState.channelId === currentChannelID &&
		newState.channelId !== currentChannelID &&
		newState.id !== clientId) {
			console.log("test");
			let resource = getBooResource(getRandomBoo());
			const player = createAudioPlayer();
			player.play(resource);
			isBooingPlaying = true;
	
			player.on(AudioPlayerStatus.AutoPaused, () => {
				isBooingPlaying = false;
			});
			
			connection.subscribe(player);
		}
})
