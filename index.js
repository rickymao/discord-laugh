const { getRandomLaugh, getLaughResource } = require('./laughs');
const { getRandomCheer, getCheerResource } = require('./cheers');
const { getRandomBoo, getBooResource } = require('./boos');
const { Client, Intents } = require('discord.js');
const { generateMockUserSpeakingMap } = require('./tests/tests');
const SpeechTracker = require('./SpeechTracker/SpeechTracker');
const SoundQueue = require('./SoundQueue/SoundQueue');
const AppState = require('./AppState/AppState');
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

client.on('messageCreate', (message) => {
	if (message.content.length <= 1) { return; }
	const prefix = message.content[0];
	console.log(message.content);
	if (prefix === "!") {
		const commandInfo = message.content.substring(1).split(/\s+/);
		const command = commandInfo[0];

		if (command === "test") {
			const params = commandInfo.slice(1);
			if (params.length != 2) {
				return;
			}
			const channel = message.member.voice.channel;
			currentChannelID = channel.id;
			const connection = joinVoiceChannel({
				selfDeaf: false,
				channelId: channel.id,
				guildId: channel.guild.id,
				adapterCreator: channel.guild.voiceAdapterCreator
			});
			const receiver = connection.receiver;


		}
	}
})
client.on('interactionCreate', async interaction => {

	if (!interaction.isCommand()) { return; }

	if (interaction.commandName === "track") {
		let laughQueue = new SoundQueue();
		const tracker = new SpeechTracker();
		const appState = new AppState();

		const channel = interaction.member.voice.channel;
		currentChannelID = channel.id;
		const connection = joinVoiceChannel({
			selfDeaf: false,
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator
		});
		const receiver = connection.receiver;

		const speakAction = (isSpeaking) => {
			if (!isSpeaking) {
				laughQueue.addToQueue(setTimeout(() => {
					if (tracker.isAllUsersNotSpeaking() && !appState.isLaughPlaying) {
						const player = createAudioPlayer();
						player.on(AudioPlayerStatus.Idle, () => {
							appState.setLaughState(false);
						});
		
						player.on(AudioPlayerStatus.AutoPaused, () => {
							appState.setLaughState(false);
						});
		
						player.on(AudioPlayerStatus.Playing, () => {
							appState.setLaughState(true);
						});				
						let resource = getLaughResource(getRandomLaugh());
						player.play(resource);
						connection.subscribe(player);
					}
				}, 1000));
			} else {
				laughQueue.clearQueue();
			}
		}

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
 					tracker.emit('speak', stream.id, false, () => speakAction(false));
				} else {
					tracker.emit('speak', stream.id, true, () => speakAction(true));
				}
			});
		}
	}
});

// client.on('voiceStateUpdate', (oldState, newState) => {
// 	const connection = getVoiceConnection(newState.guild.id);
// 	if (connection && 
// 		currentChannelID && 
// 		oldState.channelId !== currentChannelID &&
// 		newState.channelId === currentChannelID &&
// 		newState.id !== clientId && !isCheeringPlaying) {
// 		let resource = getCheerResource(getRandomCheer());
// 		const player = createAudioPlayer();
// 		player.play(resource);
// 		console.log("CHEERING");
// 		isCheeringPlaying = true;

// 		player.on(AudioPlayerStatus.AutoPaused, () => {
// 			isCheeringPlaying = false;
// 		});

// 		player.on(AudioPlayerStatus.Idle, () => {
// 			isCheeringPlaying = false;
// 		});
		
// 		connection.subscribe(player);
		
// 	} else if (connection && 
// 		currentChannelID && 
// 		oldState.channelId === currentChannelID &&
// 		newState.channelId !== currentChannelID &&
// 		newState.id !== clientId) {
// 			console.log("test");
// 			let resource = getBooResource(getRandomBoo());
// 			const player = createAudioPlayer();
// 			player.play(resource);
// 			isBooingPlaying = true;
	
// 			player.on(AudioPlayerStatus.AutoPaused, () => {
// 				isBooingPlaying = false;
// 			});
// 			player.on(AudioPlayerStatus.Idle, () => {
// 				isBooingPlaying = false;
// 			});
			
// 			connection.subscribe(player);
// 		}
// })
