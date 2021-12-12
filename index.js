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
	EndBehaviorType
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { join } = require('path');
const { createReadStream } = require('fs');
const { token } = require('./config/config.json');

const { EventEmitter } = require('events');
const usersSpeakingMap = {};
let isLaughPlaying = false;
const usersSpeakingMapEmitter = new EventEmitter();

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

	if (isAllUsersNotSpeaking() && !isLaughPlaying) {
		let resource = createAudioResource(join(__dirname, 'test.mp3'));
		const player = createAudioPlayer();
		
		player.play(resource);
		connection.subscribe(player);
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

const player = createAudioPlayer({
	behaviors: {
		noSubscriber: NoSubscriberBehavior.Play,
	},
});

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

		console.log({userStreams});
		const newStreams = userStreams.map((userStream) => {
			userStream.isTalking = false;
			return userStream;
		});
		console.log({newStreams});
		// Listen to when they start and stop
		for (const stream of newStreams) {
			stream.on('data', (chunk) => {
				const chunkString = JSON.stringify(chunk);
				const chunkObj = JSON.parse(chunkString);
				if (isArrayMatch(chunkObj.data, [248, 255, 254])) {
					usersSpeakingMap[stream.id] = false;
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
		let resource = createAudioResource(join(__dirname, 'test.mp3'));
		const player = createAudioPlayer();
		
		player.play(resource);
		connection.subscribe(player);
		
		player.on(AudioPlayerStatus.Idle, () => connection.destroy());
		
		player.on(AudioPlayerStatus.Playing, () => {
			console.log('playing');
		});
		player.on(AudioPlayerStatus.Idle, () => {
			console.log('Idle');
		});

	}
});
