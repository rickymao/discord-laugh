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
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const { join } = require('path');
const { createReadStream } = require('fs');
const { token } = require('./config/config.json');

const player = createAudioPlayer({
	behaviors: {
		noSubscriber: NoSubscriberBehavior.Play,
	},
});

player.on('error', error => {
	console.error('Error:', error.message, 'with track', error.resource.metadata.title);
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

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) { return; }

	if (interaction.commandName === "laugh") {
		const channel = interaction.member.voice.channel;
		const connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator
		});

		try {
			await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
		} catch (e) {
			console.log({ e });
		}

		connection.on(VoiceConnectionStatus.Ready, () => {
			console.log('The connection has entered the Ready state - ready to play audio!');
		});
		const resource = createAudioResource(join(__dirname, 'test.mp3'), { inlineVolume: true });
		player.play(resource);
		connection.subscribe(player);

		
		player.on(AudioPlayerStatus.Playing, () => {
			console.log('playing');
		});
		player.on(AudioPlayerStatus.Idle, () => {
			console.log('Idle');
		});

}})

