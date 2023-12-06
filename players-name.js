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
				const betNumber = Number(bet.split('₽')[0].replace(/ /gi, ''));
				if (xEl) {
					x = xEl.innerText;
					xNumber = Number(x.replace(/x/gi, ''));
				}
				if (winEl) betWin = betNumber * xNumber;

				return {
					name,
					bet: betNumber,
					betString: bet,
					x,
					xNumber,
					betWin,
				};
			}, player);

			// console.log(`Игрок №${index} ${gamer.name} ${gamer.bet} `);
			callback(gamer, index);
		}),
	);
};

module.exports = { getPlayerNames };
