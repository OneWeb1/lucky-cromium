const express = require('express');
const cors = require('cors');
const fs = require('fs');
//.
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

let p = {};
let coefficients = [];

const playersPath = 'players.json';
const coefficientsPath = 'coefficients.json';

const readFile = (filePath, callback) => {
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			// console.error(`Ошибка чтения файла: ${err}`);
			return;
		}

		try {
			if (data) callback(data);
		} catch (parseError) {
			// console.error('Ошибка парсинга JSON:', parseError);
		}
	});
};

const writeFile = (filePath, data) => {
	fs.writeFile(filePath, data, 'utf8', err => {
		if (err) {
			// console.error(`Ошибка записи файла: ${err}`);
			return;
		}

		// console.log('Данные успешно записаны в файл.');
	});
};

app.get('/', (req, res) => {
	res.send('Working...');
});

app.get('/players', (req, res) => {
	readFile(playersPath, data => {
		if (data) res.json(JSON.parse(data));
		res.json({ message: 'Data not found' });
	});
});

app.get('/coefficients', (req, res) => {
	readFile(coefficientsPath, data => {
		if (data) res.json(JSON.parse(data));
		res.json({ message: 'Data not found' });
	});
});

let isLockInterval = false;
let isLockAdd = false;
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
					isLockAdd = true;
					await before.roundStarted(page, betButtons);
					roundNumber++;

					if (roundNumber >= 100) throw new Error('Reload');

					try {
						const data = fs.readdirSync(coefficientsPath, 'utf-8');
						if (!coefficients.length && JSON.parse(data).length) {
							coefficients = [...JSON.parse(data)];
						}
					} catch (e) {
						console.log('Не удалось прочитать файл');
					}

					readFile(playersPath, data => {
						if (
							!Object.keys(data).length &&
							data &&
							Object.keys(JSON.parse(data)).length
						) {
							p = { ...JSON.parse(data) };
							console.log(data);
							console.log(p);
						}
					});
					readFile(coefficientsPath, data => {
						if (!coefficients.length && data && JSON.parse(data).length) {
							coefficients = [...JSON.parse(data)];
						}
					});

					await after.roundEnd(
						page,
						(player, index, length) => {
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

							if (index === 0) {
								if (isLockAdd) {
									const date = new Date();
									coefficients.unshift(player.roundX);

									writeFile(coefficientsPath, JSON.stringify(coefficients));
									setTimeout(() => {
										isLockAdd = true;
									}, 5000);
									isLockAdd = false;
								}
							}
						},
						// async coeff => {
						// 	if (coeff && isLockAdd) {
						// 		const text = await page.evaluate(el => el.innerText, coeff);
						// 		coefficients.push(text);
						// 		isLockAdd = false;
						// 	}
						// },
					);
					writeFile(playersPath, JSON.stringify(p));

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
