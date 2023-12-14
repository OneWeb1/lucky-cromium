const TelegramBot = require('./TelegramBot');
const utils = require('./utils');
const pn = require('./players-name');

const bot = new TelegramBot({
	token: '5897805933:AAEAHBWLaEVoscocpAH82AvByBcNCp2Ojdw',
	chatId: '-1001984482139',
});

const selector = '.iMfqvu';

const initSumBets = async page => {
	await page.evaluate(() => {
		const balance = 100 || (300 / 4) * 10;
		const oneBet = Math.floor((balance * 0.1) / 10) * 10;
		const twoBet = oneBet * 2;
		const betCounter = {
			one: (oneBet - 20) / 10,
			two: (twoBet - 20) / 10,
		};
		const boxes = document.querySelectorAll('.iopHCJ');
		const plus1 = boxes[0].childNodes[2];
		const plus2 = boxes[1].childNodes[2];
		const minus1 = boxes[0].childNodes[0];
		const minus2 = boxes[1].childNodes[0];
		minus1.childNodes[0].click();
		minus2.childNodes[0].click();
		for (let i = 0; i < betCounter.one; i++) {
			plus1.childNodes[0].click();
		}
		for (let i = 0; i < 1; i++) {
			plus2.childNodes[0].click();
		}
	});
};

const configureBets = async page => {
	let is = false;
	await page.waitForSelector(selector, { timeout: 390000 });
	await page.evaluate(() => {
		const inputs = document.querySelectorAll('#coef-input');
		const checkboxes = document.querySelectorAll('.iJnjYA');
		if (checkboxes && checkboxes.length >= 4) {
			checkboxes[1].click();
			checkboxes[3].click();
			inputs.forEach(input => {
				input.value = 1.5;
			});
			is = true;
		}
	});
	return is;
};

const responseBeforeRoundPlayers = async (page, callback) => {
	const skeletonSelector = '.react-loading-skeleton';

	try {
		await page.waitForSelector(skeletonSelector, { timeout: 900000 });
	} catch (e) {
		utils.watchReload();
	}

	const players = (await page.$$('.sc-hlzHbZ')) || [];

	await new Promise(resolve => setTimeout(resolve, 2500));

	if (players.length) {
		pn.getPlayerNames(
			page,
			players,
			(player, index) => {
				callback(player, index);
			},
			false,
		);
	}
};

let playerLogs = [];
let isAutoCashout = false;

const roundStarted = async (page, betButtons) => {
	if (!isAutoCashout) {
		isAutoCashout = configureBets(page);
	}
	await responseBeforeRoundPlayers(page, (player, index) => {
		playerLogs.push({
			...player,
			id: index,
		});
		if (player.name === '@PAVLOV_EVGEN') {
			if (player.bet == 5000) {
				betButtons[0].click();
			} else if (player.bet == 10000) {
				betButtons[1].click();
			}
			const date = new Date();
			bot.sendMessage(`
					  ${player.name} ${player.bet}\n
					  ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}
					  `);
		}
	});

	console.log('-------------------------------------------');
	const isSomeNames = utils.someNames(playerLogs);
	const logMessage = utils.getLogMessage(playerLogs);
	if (logMessage && isSomeNames) {
		bot.sendMessage(logMessage);
	}
	playerLogs = [];
};

module.exports = { initSumBets, configureBets, roundStarted };
