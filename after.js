const pn = require('./players-name');

const selector = '.iMfqvu';

const roundEnd = async page => {
	await page.waitForFunction(
		selector => {
			const element = document.querySelector('.cTwCmb');
			return !!element;
		},
		{ timeout: 5000000 },
		selector,
	);

	const players = (await page.$$('.sc-hlzHbZ')) || [];

	pn.getPlayerNames(
		page,
		players,
		(player, index) => {
			console.log(player);
		},
		true,
	);
};

module.exports = { roundEnd };
