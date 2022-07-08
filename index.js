const { getRandomLaugh, getLaughResource } = require('./laughs');
const { getRandomCheer, getCheerResource } = require('./cheers');
const { getRandomBoo, getBooResource } = require('./boos');
const { Client } = require('discord.js');
// const { test7 } = require('./tests/tests');
const SpeechTracker = require('./SpeechTracker/SpeechTracker');
const SoundQueue = require('./SoundQueue/SoundQueue');
const BotState = require('./BotState/BotState');
const {
	AudioPlayerStatus,
	createAudioPlayer,
	joinVoiceChannel,
	getVoiceConnection,
	VoiceConnectionStatus,
} = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
const { token, clientId } = require('./config/config.json');
const BotTracker = require('./BotTracker/BotTracker');

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
};

const listenForLaughs = (channel, receiver) => {
	// Get all user IDs in call
	const usersInCall = Array.from(channel.members.values());
	const userIDInCall = usersInCall.map((elem) => {
		return elem.user.id;
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
			}
			else {
				tracker.emit('speak', stream.id, true, () => speakAction(true));
			}
		});
	}

};

const client = new Client({ intents: ['GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILDS'] });
const botTracker = new BotTracker();
client.login(token);


client.once('ready', () => {
	try {
		console.log('Ready!');
	}
	catch (e) {
		console.log({ e });
	}

});

client.on('debug', console.log);

client.on('messageCreate', (message) => {
	if (message.content.length <= 1) { return; }
	const prefix = message.content[0];
	if (prefix === '!') {
		const commandInfo = message.content.substring(1).split(/\s+/);
		const command = commandInfo[0];

		if (command === 'join') {
			const channel = message.member.voice.channel;
			const botConnection = getVoiceConnection(message.member.guild.id);
			if (!channel || !channel.joinable) {
				const errorEmbed = new MessageEmbed()
					.setColor('#0099ff')
					.setTitle('❌ An error has occured!')
					.setDescription('You are not in a joinable voice channel.');

				message.channel.send({ embeds: [errorEmbed] });
				return;
			}
			else if (botConnection &&
			botConnection.state.status === VoiceConnectionStatus.Ready &&
			channel.id === botConnection.joinConfig.channelId) {
				const errorEmbed = new MessageEmbed()
					.setColor('#0099ff')
					.setTitle('❌ An error has occured!')
					.setDescription('The bot is already in your voice channel.');

				message.channel.send({ embeds: [errorEmbed] });
				return;
			}

			const laughQueue = new SoundQueue();
			const tracker = new SpeechTracker();
			const botState = botTracker.getState(channel.guildId) || new BotState();
			if (!botTracker.getState(channel.guildId)) {
				botTracker.addToTracker(channel.guildId, botState);
			}

			const connection = joinVoiceChannel({
				selfDeaf: false,
				channelId: channel.id,
				guildId: channel.guild.id,
				adapterCreator: channel.guild.voiceAdapterCreator,
			});
			const receiver = connection.receiver;
			const speakAction = (isSpeaking) => {
				if (!isSpeaking) {
					laughQueue.addToQueue(setTimeout(() => {
						if (tracker.isAllUsersNotSpeaking() && !botState.isLaughPlaying) {
							const player = createAudioPlayer();
							player.on(AudioPlayerStatus.Idle, () => {
								botState.setLaughState(false);
							});

							player.on(AudioPlayerStatus.AutoPaused, () => {
								botState.setLaughState(false);
							});

							player.on(AudioPlayerStatus.Playing, () => {
								botState.setLaughState(true);
							});
							const resource = getLaughResource(getRandomLaugh());
							player.play(resource);
							connection.subscribe(player);
						}
					}, 1000));
				}
				else {
					laughQueue.clearQueue();
				}
			};
			// Get all user IDs in call
			const usersInCall = Array.from(channel.members.values());
			const userIDInCall = usersInCall.map((elem) => {
				return elem.user.id;
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
					}
					else {
						tracker.emit('speak', stream.id, true, () => speakAction(true));
					}
				});
			}

			const joinEmbed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('👏 🙌 The bot has joined your channel!')
				.setDescription('The bot will automatically play the following:')
				.addFields(
					{ name: '🤣 Laughing', value: 'When there is an awkward silence between conversations' },
					{ name: '📣 Cheering', value: 'When users join the call' },
					{ name: '👎 Booing', value: 'When users leave the call' });
			message.channel.send({ embeds: [joinEmbed] });
		}
		else if (command === 'test') {
			// const laughQueue = new SoundQueue();
			// const tracker = new SpeechTracker();
			// const appState = new BotState();

			// const channel = message.member.voice.channel;
			// const connection = joinVoiceChannel({
			// 	selfDeaf: false,
			// 	channelId: channel.id,
			// 	guildId: channel.guild.id,
			// 	adapterCreator: channel.guild.voiceAdapterCreator,
			// });

			// const speakAction = (isSpeaking) => {
			// 	if (!isSpeaking) {
			// 		laughQueue.addToQueue(setTimeout(() => {
			// 			if (tracker.isAllUsersNotSpeaking() && !appState.isLaughPlaying) {
			// 				const player = createAudioPlayer();
			// 				player.on(AudioPlayerStatus.Idle, () => {
			// 					appState.setLaughState(false);
			// 				});

			// 				player.on(AudioPlayerStatus.AutoPaused, () => {
			// 					appState.setLaughState(false);
			// 				});

			// 				player.on(AudioPlayerStatus.Playing, () => {
			// 					appState.setLaughState(true);
			// 				});
			// 				const resource = getLaughResource(getRandomLaugh());
			// 				player.play(resource);
			// 				connection.subscribe(player);
			// 			}
			// 		}, 1000));
			// 	}
			// 	else {
			// 		laughQueue.clearQueue();
			// 	}
			// };

			// test7(tracker, speakAction);
		}
		else if (command === 'help') {
			const exampleEmbed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Command list')
				.setDescription('👋 Welcome! You can learn about all my commands in this cozy prompt.')
				.addFields(
					{ name: '!join', value: 'Joins your voice channel and automatically plays laughing, booing, and cheering sound effects.' },
					{ name: '!leave', value: 'Leaves your voice channel.' });

			message.channel.send({ embeds: [exampleEmbed] });
		}
		else if (command === 'leave') {
			const connection = getVoiceConnection(message.member.voice.channel.guild.id);
			if (!connection) {
				const errorEmbed = new MessageEmbed()
					.setColor('#0099ff')
					.setTitle('❌ An error has occured!')
					.setDescription('The bot is currently not connected to any voice channels.');

				message.channel.send({ embeds: [errorEmbed] });
				return;
			}

			const userVoiceChannel = message.member.voice.channel;
			if (userVoiceChannel.id !== connection.joinConfig.channelId) {
				const errorEmbed = new MessageEmbed()
					.setColor('#0099ff')
					.setTitle('❌ An error has occured!')
					.setDescription('You must be in the same voice channel as the bot.');

				message.channel.send({ embeds: [errorEmbed] });
				return;
			}

			connection.disconnect();
			connection.destroy();
			const leaveEmbed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('🏃 The bot has left your channel!');

			message.channel.send({ embeds: [leaveEmbed] });
			return;
		}
	}
});

client.on('voiceStateUpdate', (oldState, newState) => {
	const connection = getVoiceConnection(newState.guild.id);
	if (!connection) { return; }
	const currentBotState = botTracker.getState(newState.guild.id);
	if (!currentBotState) { return; }

	const currentChannelID = connection.joinConfig.channelId;
	const userID = newState.id;
	if (connection &&
		currentChannelID &&
		oldState.channelId !== currentChannelID &&
		newState.channelId === currentChannelID &&
		userID !== clientId && !currentBotState.isCheeringPlaying) {
		const resource = getCheerResource(getRandomCheer());
		const player = createAudioPlayer();
		player.play(resource);
		currentBotState.setCheerState(true);

		player.on(AudioPlayerStatus.AutoPaused, () => {
			currentBotState.setCheerState(false);
		});
		player.on(AudioPlayerStatus.AutoPaused, () => {
			currentBotState.setCheerState(false);
		});
		player.on(AudioPlayerStatus.Idle, () => {
			currentBotState.setCheerState(false);
		});

		connection.subscribe(player);
	}
	else if (connection &&
		currentChannelID &&
		oldState.channelId === currentChannelID &&
		newState.channelId !== currentChannelID &&
		userID !== clientId && !currentBotState.isBooingPlaying) {
		const resource = getBooResource(getRandomBoo());
		const player = createAudioPlayer();
		player.play(resource);

		player.on(AudioPlayerStatus.AutoPaused, () => {
			currentBotState.setBooState(false);
		});
		player.on(AudioPlayerStatus.AutoPaused, () => {
			currentBotState.setBooState(false);
		});
		player.on(AudioPlayerStatus.Idle, () => {
			currentBotState.setBooState(false);
		});

		connection.subscribe(player);
	}

	// TODO: generate new user map when bot swaps to diff channel
	if (userID === clientId && newState.channelId !== currentChannelID) {
		
	}
});
