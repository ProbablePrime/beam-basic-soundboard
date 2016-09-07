'use strict';
module.exports = function (config, beam) {
	if (config.token) {
		return oAuth(config, beam);
	}
	if (config.username && config.password) {
		return password(config, beam);
	}
	throw new Error('No Auth found');
};

function oAuth(config, beam) {
	if (!config.token || config.token === '<TOKEN HERE>') {
		throw new Error('Missing authentication token');
	}
	beam.use('oauth', {
		tokens: {
			access: config.token,
			expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
		}
	});
	return beam.request('GET', `users/current`).then(res => res.body);
}

function password(config, beam) {
	return beam.use('password', config).attempt().then(res => res.body);
}
