const path = require('path');
const sfx = require('sfx');

const Packets = require('beam-interactive-node/dist/robot/packets').default;

class Handler {
	constructor(sounds) {
		this.sounds = sounds;
		this.sounds.forEach(sound => {
			sound.votes = 0;
		});
	}
	handleReport(report) {
		let fired = false;
		let firedId = 0;
		const progress = {
			tactile: []
		};
		progress.tactile = report.tactile.map(tactile => {
			const tactileProgress = {
				id: tactile.id
			};
			const sound = this.findSound(tactile.id);

			if (!sound || tactile.pressFrequency < 1) {
				return undefined;
			}
			sound.votes += tactile.pressFrequency;
			tactileProgress.progress = percentage(sound.votes, sound.votesRequired);

			if (sound.votes >= sound.votesRequired) {
				this.triggerSound(sound);
				fired = true;
				firedId = tactile.id;
				tactileProgress.fired = true;
				tactileProgress.cooldown = sound.cooldown;
				sound.votes = 0;
			}

			return new Packets.ProgressUpdate.TactileUpdate(tactileProgress);
		}).filter(sound => sound !== undefined);
		//Overwrite to 1 minute if fired.
		if (fired) {
			progress.tactile = this.sounds.map(sound => {
				let thisFired = false;
				if (sound.id === firedId) {
					thisFired = true;
				}
				return new Packets.ProgressUpdate.TactileUpdate({
					id: sound.id,
					cooldown: 60 * 1000,
					fired: thisFired
				});
			})
		}
		if (progress.tactile.length) {
			return new Packets.ProgressUpdate(progress);
		}
	}
	findSound(id) {
		return this.sounds.find(sound => sound.id === id);
	}
	triggerSound(sound) {
		sfx.play(this.makePath(sound));
	}
	makePath(sound) {
		return path.join(__dirname, '../sounds', sound.file);
	}
}

function percentage(val, max) {
	if (val === 0 || max === 0) {
		return 0;
	}
	return val / max;
}

module.exports = Handler;
