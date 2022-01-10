const {
	createAudioResource,
} = require('@discordjs/voice');
const { join } = require('path');

const cheerList = [
	'cheer_01.mp3',
	'cheer_02.mp3',
	'cheer_03.mp3',
];

exports.getRandomCheer = () => {
	const randomIdx = Math.floor(Math.random() * (cheerList.length));
	return cheerList[randomIdx];
};

exports.getCheerResource = (cheerID) => {
	const resource = createAudioResource(join('/Users/rickm/Desktop/discord-laugh/cheers', cheerID));
	return resource;
};