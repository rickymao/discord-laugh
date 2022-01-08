exports.test1 = (tracker, speakAction) => {
	console.log('RUNNING TEST 1: When one user talks and the other user talks then both stop');
	tracker.emit('speak', '1', true, () => speakAction(true));
	tracker.emit('speak', '2', true, () => speakAction(true));
	setTimeout(() => {
		tracker.emit('speak', '1', false, () => speakAction(false));
		tracker.emit('speak', '2', false, () => speakAction(false));
		console.log('TEST 1 FINISHED');
	}, 5000);
};

exports.test2 = (tracker, speakAction) => {
	console.log('RUNNING TEST 2: When one user is talking and the other user continues to talk and only one stops then the other stops');
	tracker.emit('speak', '1', true, () => speakAction(true));
	tracker.emit('speak', '2', true, () => speakAction(true));
	setTimeout(() => {
		tracker.emit('speak', '1', false, () => speakAction(false));
	}, 2000);
	setTimeout(() => {
		tracker.emit('speak', '2', false, () => speakAction(false));
		console.log('TEST 2 FINISHED');
	}, 5000);
};

exports.test3 = (tracker, speakAction) => {
	console.log('RUNNING TEST 3: When one user talks and then the other one talks less than 1 second after the first user stops');
	tracker.emit('speak', '1', true, () => speakAction(true));
	setTimeout(() => {
		tracker.emit('speak', '1', false, () => speakAction(false));
	}, 2000);
	setTimeout(() => {
		tracker.emit('speak', '2', true, () => speakAction(true));
	}, 2500);
	setTimeout(() => {
		tracker.emit('speak', '2', false, () => speakAction(false));
		console.log('TEST 3 FINISHED');
	}, 5000);
};

exports.test4 = (tracker, speakAction) => {
	console.log('RUNNING TEST 4: When one user is talking and the other user continues to talk and only one stops then the other stops');
	tracker.emit('speak', '1', true, () => speakAction(true));
	setTimeout(() => {
		tracker.emit('speak', '1', false, () => speakAction(false));
	}, 2000);
	setTimeout(() => {
		tracker.emit('speak', '2', true, () => speakAction(true));
	}, 2500);
	setTimeout(() => {
		tracker.emit('speak', '2', false, () => speakAction(false));
	}, 3000);
	setTimeout(() => {
		tracker.emit('speak', '1', true, () => speakAction(true));
	}, 3500);
	setTimeout(() => {
		tracker.emit('speak', '1', false, () => speakAction(false));
	}, 4000);
	setTimeout(() => {
		tracker.emit('speak', '2', true, () => speakAction(true));
	}, 4500);
	setTimeout(() => {
		tracker.emit('speak', '2', false, () => speakAction(false));
		console.log('TEST 4 FINISHED');
	}, 5000);
};

exports.test5 = (tracker, speakAction) => {
	console.log('RUNNING TEST 5: When X amount of users talk back and forth with less than 1 second gaps in between');
	for (let i = 1; i < 20; i += 2) {
		setTimeout(() => {
			tracker.emit('speak', `${i}`, true, () => speakAction(true));
		}, 500 * (i - 1));

		if (i === 19) {
			setTimeout(() => {
				tracker.emit('speak', `${i}`, false, () => speakAction(false));
				console.log('TEST 5 FINISHED');
			}, 500 * i);
		}
		else {
			setTimeout(() => {
				tracker.emit('speak', `${i}`, false, () => speakAction(false));
			}, 500 * i);
		}
	}
};

exports.test6 = (tracker, speakAction) => {
	console.log('RUNNING TEST 6: When X users are talking at that same time and then all users stop talking');
	for (let i = 0; i < 10; i++) {
		tracker.emit('speak', `${i}`, true, () => speakAction(true));
	}
	setTimeout(() => {
		for (let i = 0; i < 10; i++) {
			tracker.emit('speak', `${i}`, false, () => speakAction(false));
		}
		console.log('TEST 6 FINISHED');
	}, 5000);
};

exports.test7 = (tracker, speakAction) => {
	console.log('RUNNING TEST 7: X users talking in the same time, but Y users stop talking, while X - Y users continue talking');
	for (let i = 0; i < 20; i++) {
		tracker.emit('speak', `${i}`, true, () => speakAction(true));
	}
	setTimeout(() => {
		for (let i = 0; i < 10; i++) {
			tracker.emit('speak', `${i}`, false, () => speakAction(false));
		}
	}, 5000);
	setTimeout(() => {
		for (let i = 10; i < 20; i++) {
			tracker.emit('speak', `${i}`, false, () => speakAction(false));
		}
		console.log('TEST 7 FINISHED');
	}, 10000);
};

