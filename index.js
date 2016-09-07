const Beam = require('beam-client-node');
const Interactive = require('beam-interactive-node');

const config = require('config');
const reconnector = require('./lib/reconnector');
const auth = require('./lib/auth.js');

const beam = new Beam();
const Handler = require('./lib/Handler');

let channelId;
let robot;

const handler = new Handler(config.get('sounds'));

function performRobotHandshake(robot) {
	return new Promise((resolve, reject) => {
		robot.handshake(err => {
			if (err) {
				reject(err);
			}
			onInteractiveConnect(err);
			resolve();
		});
	});
}

function onInteractiveConnect(err) {
	if (err) {
		console.log('Theres a problem connecting to Interactive');
		console.log(err);
	} else {
		console.log('Connected to Interactive');
	}
}

function launch() {
	return beam.game.join(channelId).then(details => {
		console.log('Authenticated, Spinning up Interactive Connection');
		robot = new Interactive.Robot({
			remote: details.body.address,
			key: details.body.key,
			channel: channelId
		});
		robot.on('report', report => {
			const progress = handler.handleReport(report);
			if (progress) {
				robot.send(progress);
			}
		});
		robot.on('error', code => console.log(code));
		reconnector(robot, launch, onInteractiveConnect);
		return performRobotHandshake(robot);
	});
}

auth(config.get('auth'), beam)
.then(user => {
	channelId = user.channel.id;
})
.then(launch)
.catch(err => {
	if (err.message !== undefined && err.message.body !== undefined) {
		console.log(err);
	} else {
		throw err;
	}
});
