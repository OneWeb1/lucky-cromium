const pn = require('./players-name');

const selector = '.iMfqvu';

const roundEnd = async (page, callback, callback2) => {
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
	if (callback2) callback2(await page.$('.sc-ksBlkl'));
};

module.exports = { roundEnd };
