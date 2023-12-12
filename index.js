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
	origin: [
		'http://localhost:5173',
		'https://luckyjet-ood7z7acf-oneweb1.vercel.app',
	],
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

let p = {};
let coefficients = [];
let message = 'Scrape worked...';
let number = 0;

const playersPath = 'players.json';
const coefficientsPath = 'coefficients.json';

const bot = new TelegramBot({
	token: '5897805933:AAEAHBWLaEVoscocpAH82AvByBcNCp2Ojdw',
	chatId: '-1001984482139',
});

const readFile = (filePath, callback) => {
	try {
		const data = fs.readFileSync(filePath, 'utf8');
		callback(data);
	} catch (e) {}
};

const writeFile = (filePath, data) => {
	fs.writeFileSync(filePath, data, 'utf8');
};

app.get('/', (req, res) => {
	res.send('Working...');
});

app.get('/scrape', (req, res) => {
	res.send(`${message}: ${number}`);
});

app.get('/players', (req, res) => {
	fs.access(playersPath, fs.constants.F_OK, err => {
		if (err) {
			res.json({ message: 'Data not found' });
		} else {
			readFile(playersPath, data => {
				if (data) res.json(JSON.parse(data));
			});
		}
	});
});

app.get('/coefficients', (req, res) => {
	fs.access(coefficientsPath, fs.constants.F_OK, err => {
		if (err) {
			res.json({ message: 'Data not found' });
		} else {
			readFile(coefficientsPath, data => {
				if (data) res.json(JSON.parse(data));
			});
		}
	});
});

setInterval(() => {
	bot.sendMessage(new Date().getTime());
	number++;
}, 1000);

let isLockInterval = false;
let isStarted = false;
let roundNumber = 0;
let unlockNumber = 0;
const deltaTime = [new Date()];

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
				const date = new Date();
				console.log({
					hour: date.getHours(),
					minutes: date.getMinutes(),
					seconds: date.getSeconds(),
				});
				console.log({ roundNumber });
				try {
					isLockInterval = true;
					await before.roundStarted(page, betButtons);
					roundNumber++;

					//if (roundNumber >= 100) throw new Error('Reload');

					if (roundNumber && (!isStarted || new Date() - deltaTime[0] > 6000)) {
						fs.access(playersPath, fs.constants.F_OK, err => {
							if (err) {
								writeFile(playersPath, JSON.stringify({}));
							} else {
								readFile(playersPath, data => {
									if (!Object.keys(p).length && data && JSON.parse(data)) {
										p = JSON.parse(data);
									}
								});
							}
						});

						fs.access(coefficientsPath, fs.constants.F_OK, err => {
							if (err) {
								writeFile(coefficientsPath, JSON.stringify([]));
							} else {
								readFile(coefficientsPath, data => {
									if (!coefficients.length && data && JSON.parse(data).length) {
										coefficients = [...JSON.parse(data)];
										number++;
									}
								});
							}
						});

						await after.roundEnd(page, (player, index, length) => {
							const name = player.name;
							const date = new Date();

							if (!p[name] && player.name.length >= 3) {
								p[name] = {
									avatar: randomRGBA(),
									name,
									games: [],
								};
							}
							if (p[name]) {
								p[name].games.push({
									betNumber: player.bet,
									betString: player.betString,
									x: player.x,
									xNumber: player.xNumber,
									roundX: player.roundX,
									betWin: player.betWin,
									date: {
										year: date.getFullYear(),
										month: date.getMonth(),
										date: date.getDate(),
										day: date.getDay(),
										hours: date.getHours(),
										minutes: date.getMinutes(),
										seconds: date.getSeconds(),
									},
								});
							}
							if (index === length - 1) {
								console.log(new Date() - deltaTime[0]);
								coefficients.unshift(player.roundX);
								writeFile(coefficientsPath, JSON.stringify(coefficients));
								writeFile(playersPath, JSON.stringify(p));
								deltaTime.unshift(new Date());
								if (deltaTime.length > 5) deltaTime.pop();
								console.log(player.roundX);
							}
						});
						isStarted = true;
					}
				} catch (e) {
					message = e;
					console.log('client_loop: send disconnect: Connection reset');
					console.log(e);
					//utils.watchReload();
				}
				unlockNumber = 0;
				isLockInterval = false;
			}
		}, 1);
	} catch (e) {
		message = e;
		console.log(e);
		console.log('App crashed');
		//utils.watchReload();
	}
};

app.listen(3003, () => {
	luckyParser();
	console.log('Сервер запущен на порту 3000');
});

/*1
Xvfb -ac :0 -screen 0 1280x1024x16 &
export DISPLAY=:0

pm2 start index.js --wait-ready --watch --ignore-watch="node_modules players.json coefficients.json .git/index.lock" --no-daemon
*/
