const {
	createAudioResource,
} = require('@discordjs/voice');
const { join } = require('path');

const booList = [
	'boo_01.mp3',
];

exports.getRandomBoo = () => {
	const randomIdx = Math.floor(Math.random() * (booList.length));
	return booList[randomIdx];
};

exports.getBooResource = (booID) => {
	const resource = createAudioResource(join('/Users/rickm/Desktop/discord-laugh/boos', booID));
	console.log(join('/Users/rickm/Desktop/discord-laugh/boos', booID));
	return resource;
};