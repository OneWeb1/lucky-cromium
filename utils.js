const fs = require('fs');

const watchReload = () => {
	fs.writeFile('reload.json', 'reload', err => {
		if (err) {
			console.error('Error writing to file:', err);
		} else {
			console.log('Data written to file successfully.');
		}
	});
};

const getLogMessage = array => {
	return array.length
		? array
				.map(player => `Игрок №${player.id} ${player.name} ${player.bet}\n`)
				.join('')
		: 'Wait players...';
};

const someNames = array => array.some(player => player.name.trim().length >= 3);

module.exports = { watchReload, getLogMessage, someNames };
