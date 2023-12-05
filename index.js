const express = require('express');
const cors = require('cors');
const fs = require('fs');

const TelegramBot = require('./TelegramBot');
const browser = require('./browser');
const before = require('./before');
const after = require('./after');
const utils = require('./utils');

const url =
	'https://lucky-jet.gamedev-atech.cc/?exitUrl=null&language=uk&b=8137c4e5b3acab20ae1f3beb43efac9a78fcaa7c4a27cd6e8a02bf5074ba8de9857cf583774d79836cd757f40d50d77dd3b276632df2208273725233bae66c554f83a1d1981b5f2fb0b84ed7222c2f5399a3c25fb5752c3859468772cedb1166b93c6f9070.80429a59887f8724d9270af78d143b0a';

const app = express();
const corsOptions = {
	origin: 'http://localhost:5173',
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const p = {};

app.get('/', (req, res) => {
	res.send('Working...');
});

app.get('/players', (req, res) => {
	res.json(p);
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

		const randomRGBA = () => {
			const random = () => Math.floor(Math.random() * 150);
			return `rgba(${random()}, ${random()}, ${random()}, 1)`;
		};

		const interval = setInterval(async () => {
			if (!isLockInterval) {
				try {
					isLockInterval = true;
					await before.roundStarted(page, betButtons);
					roundNumber++;

					if (roundNumber >= 100) throw new Error('Reload');

					await after.roundEnd(page, player => {
						const name = player.name;
						const date = new Date();
						if (!p[name] && player.name.length >= 3) {
							p[name] = {
								avatar: randomRGBA(),
								name,
								games: [],
							};
						}
						if (p[name])
							p[name].games.push({
								betNumber: player.bet,
								betString: player.betString,
								x: player.x,
								betWin: player.betWin,
								date: {
									hours: date.getHours(),
									minutes: date.getMinutes(),
									seconds: date.getSeconds(),
								},
							});
					});
					// fs.writeFile('players.json', JSON.stringify(p), err => {
					// 	if (err) {
					// 		console.error('Error writing to file:', err);
					// 	} else {
					// 		console.log('Data written to file successfully.');
					// 	}
					// });

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
