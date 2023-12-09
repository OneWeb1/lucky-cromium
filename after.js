const pn = require('./players-name');

const selector = '.iMfqvu';

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
		(player, index) => {
			callback(player, index, playersEl.length);
		},
		true,
	);
};

module.exports = { roundEnd };
