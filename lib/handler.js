const path = require('path');
const sfx = require('sfx');

const Packets = require('beam-interactive-node/dist/robot/packets').default;

class Handler {
	constructor(sounds, globalCooldown) {
		this.globalCooldown = globalCooldown;
		this.sounds = sounds;
		this.sounds.forEach(sound => {
			sound.votes = 0;
		});
	}
	handleReport(report) {
		let firedSound = null;
		const progress = {
			tactile: []
		};
		progress.tactile = report.tactile.map(tactile => {
			const tactileProgress = {
				id: tactile.id,
				fired: false
			};
			const sound = this.findSound(tactile.id);

			if (!sound || tactile.pressFrequency < 1) {
				return undefined;
			}
			sound.votes += tactile.pressFrequency;

			tactileProgress.progress = percentage(sound.votes, sound.votesRequired);

			if (sound.votes >= sound.votesRequired) {
				this.triggerSound(sound);
				firedSound = tactile.id;
				tactileProgress.cooldown = sound.cooldown;
				sound.votes = 0;
				tactileProgress.fired = true;
			}

			return new Packets.ProgressUpdate.TactileUpdate(tactileProgress);
		}).filter(sound => sound !== undefined);

		// Trigger a global 1 minute cooldown if we have fired a sound
		if (firedSound !== null && this.globalCooldown.enabled) {
			// For each sound, global cooldown.
			progress.tactile = this.sounds.map(sound => {
				let thisFired = false;

				// Reset votes on this sound.
				sound.votes = 0;

				let tactileProgress = {
					id: sound.id,
					cooldown: this.globalCooldown.time,
					fired: sound.id === firedSound,
					progress: percentage(sound.votes, sound.votesRequired)
				};

				return new Packets.ProgressUpdate.TactileUpdate(tactileProgress);
			});
			firedSound = null;
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
