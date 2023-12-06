const getPlayerNames = async (page, players, callback) => {
	await Promise.all(
		players.map(async (player, index) => {
			const gamer = await page.evaluate(player => {
				const nameEl = player.querySelector('.sc-gInZnl');
				const betEl = player.querySelector('.sc-ACYlI');
				const xEl = player.querySelector('.sc-fLcnxK');
				const winEl = document.querySelector('.sc-fFRahO');

				let name = '0';
				let bet = '0';
				let x = '-';
				let xNumber = 0;
				let betWin = '-';

				if (nameEl) name = nameEl.innerText;
				if (betEl) bet = betEl.innerText;
				const betNumber =
					bet !== '0' ? Number(bet.split('₽')[0].replace(/\s/gi, '')) : 0;
				if (xEl) {
					x = xEl.innerText;
					xNumber = Number(x.replace(/x/gi, ''));
				}
				if (winEl)
					betWin = betNumber * xNumber === '0' ? '-' : betNumber * xNumber;

				return {
					name,
					bet: betNumber,
					betString: bet,
					x,
					xNumber,
					betWin,
				};
			}, player);

			callback(gamer, index);
		}),
	);
};

module.exports = { getPlayerNames };
