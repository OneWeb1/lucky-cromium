const express = require('express');
const fs = require('fs');

const TelegramBot = require('./TelegramBot');
const browser = require('./browser');
const before = require('./before');
const after = require('./after');
const utils = require('./utils');

const url =
	'https://lucky-jet.gamedev-atech.cc/?exitUrl=null&language=uk&b=8137c4e5b3acab20ae1f3beb43efac9a78fcaa7c4a27cd6e8a02bf5074ba8de9857cf583774d79836cd757f40d50d77dd3b276632df2208273725233bae66c554f83a1d1981b5f2fb0b84ed7222c2f5399a3c25fb5752c3859468772cedb1166b93c6f9070.80429a59887f8724d9270af78d143b0a';

const app = express();

app.get('/', (req, res) => {
	res.send('Working...');
});

let isLockInterval = false;
let roundNumber = 0;

const luckyParser = async () => {
	try {
		const chromium = await browser.launch();

		const page = await browser.createPage(chromium, url);

		await page.waitForSelector('.fhnxTh', { timeout: 500000 });

		await before.initSumBets(page);

		let betButtons = await page.$$('.kuWarE');

		const interval = setInterval(async () => {
			if (!isLockInterval) {
				try {
					isLockInterval = true;
					await before.roundStarted(page, betButtons);
					roundNumber++;

					if (roundNumber >= 100) throw new Error('Reload');

					await after.roundEnd(page);

					isLockInterval = false;
				} catch (e) {
					console.log('client_loop: send disconnect: Connection reset');
					console.log(e);
					utils.watchReload();
				}
			}
		}, 1);
	} catch (e) {
		console.log('App crashed');
		utils.watchReload();
	}
};

app.listen(3003, () => {
	luckyParser();
	console.log('Сервер запущен на порту 3000');
});
