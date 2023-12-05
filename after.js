const pn = require('./players-name');

const selector = '.iMfqvu';
let players = [];

const roundEnd = async (page, callback) => {
	await page.waitForFunction(
		selector => {
			const element = document.querySelector('.cTwCmb');
			return !!element;
		},
		{ timeout: 5000000 },
		selector,
	);

	const playersEl = (await page.$$('.sc-hlzHbZ')) || [];

	pn.getPlayerNames(
		page,
		playersEl,
		player => {
			players.push(player);
		},
		true,
	);
	callback(players);
};

module.exports = { roundEnd };
