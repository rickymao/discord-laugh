const {
	createAudioResource,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');

exports.getLaughResource = (laughLink) => {
    const stream = ytdl(laughLink, { filter: 'audioonly' });
    const resource = createAudioResource(stream);

    return resource;
}