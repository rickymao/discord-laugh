const {
	createAudioResource,
} = require('@discordjs/voice');
const { join } = require('path');

const laughList = [
    'laugh_01.mp3',
    'laugh_02.mp3',
    'laugh_03.mp3',
    'laugh_04.mp3',
    'laugh_05.mp3',
    'laugh_06.mp3',
    'laugh_07.mp3',
    'laugh_08.mp3',
    'laugh_09.mp3',
    'laugh_10.mp3',
    'laugh_11.mp3',
    'laugh_12.mp3',
    'laugh_13.mp3',
    'laugh_14.mp3',
    'laugh_15.mp3',
    'laugh_16.mp3',
]

exports.getRandomLaugh = () => {
    const randomIdx = Math.floor(Math.random() * (laughList.length));
    return laughList[randomIdx];
}

exports.getLaughResource = (laughID) => {
    const resource = createAudioResource(join("/Users/rickm/Desktop/discord-laugh/laughs", laughID));
    return resource;
}