const express = require('express');
const chromium = require('chrome-aws-lambda');
const axios = require('axios');

class TelegramBot {
	constructor(config) {
		Object.assign(this, { config });
		this.token = this.config.token;
		this.chatId = this.config.chatId;
		this.urlApi = 'https://api.telegram.org/bot' + this.token + '/sendMessage';
	}

	async sendMessage(message) {
		try {
			await axios.post(this.urlApi, {
				chat_id: this.chatId,
				parse_mode: 'html',
				text: message,
			});
		} catch (error) {
			console.error('Error sending message:', error);
		}
	}
}

const url =
	'https://lucky-jet.gamedev-atech.cc/?exitUrl=null&language=uk&b=8137c4e5b3acab20ae1f3beb43efac9a78fcaa7c4a27cd6e8a02bf5074ba8de9857cf583774d79836cd757f40d50d77dd3b276632df2208273725233bae66c554f83a1d1981b5f2fb0b84ed7222c2f5399a3c25fb5752c3859468772cedb1166b93c6f9070.80429a59887f8724d9270af78d143b0a';

const app = express();

app.get('/', (req, res) => {
	res.send('Working...');
});

(async () => {
	try {
		const bot = new TelegramBot({
			token: '5897805933:AAEAHBWLaEVoscocpAH82AvByBcNCp2Ojdw',
			chatId: '-1001984482139',
		});
		const browser = await chromium.puppeteer.launch({
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-accelerated-2d-canvas',
				'--no-first-run',
				'--no-zygote',
				// "--single-process",
				'--disable-gpu',
				'--display=:0',
			],
			defaultViewport: chromium.defaultViewport,
			executablePath: await chromium.executablePath,
			headless: chromium.headless,
			ignoreHTTPSErrors: false,
		});

		const page = await browser.newPage();

		const client = await page.target().createCDPSession();
		const { width, height } = await page.evaluate(() => {
			return {
				width: window.outerWidth,
				height: window.outerHeight - 250,
			};
		});

		await client.send('Emulation.setDeviceMetricsOverride', {
			width,
			height,
			deviceScaleFactor: 1,
			mobile: false,
		});
		await page.setDefaultNavigationTimeout(60000);
		await page.goto(url);

		await page.waitForSelector('.fhnxTh', { timeout: 300000 });

		await page.evaluate(() => {
			const balance = 500 || (300 / 4) * 10;
			const oneBet = Math.floor((balance * 0.1) / 10) * 10;
			const twoBet = oneBet * 2;
			const betCounter = {
				one: (oneBet - 20) / 10,
				two: (twoBet - 20) / 10,
			};
			const boxes = document.querySelectorAll('.iopHCJ');
			const plus1 = boxes[0].childNodes[2];
			const plus2 = boxes[1].childNodes[2];
			for (let i = 0; i < betCounter.one; i++) {
				plus1.childNodes[0].click();
			}
			for (let i = 0; i < betCounter.two; i++) {
				plus2.childNodes[0].click();
			}
		});

		const betButtons = await page.$$('.kuWarE');
		const selector = '.iMfqvu';
		let isUatoCashout = false;
		let isLockInterval = false;

		setInterval(async () => {
			try {
				if (!isLockInterval) {
					isLockInterval = true;
					// if (!isUatoCashout) {
					// 	await page.waitForSelector(selector, { timeout: 390000 });
					// 	await page.evaluate(() => {
					// 		const inputs = document.querySelectorAll('#coef-input');
					// 		const checkboxes = document.querySelectorAll('.iJnjYA');
					// 		checkboxes[1].click();
					// 		checkboxes[3].click();
					// 		inputs.forEach(input => {
					// 			input.value = 1.5;
					// 		});
					// 	});

					// 	isUatoCashout = true;
					// }

					const skeletonSelector = '.react-loading-skeleton';

					await page.waitForSelector(skeletonSelector, { timeout: 90000 });

					const players = (await page.$$('.sc-hlzHbZ')) || [];
					let playerLogs = [];

					await new Promise(resolve => setTimeout(resolve, 2500));
					bot.sendMessage('Вивод игроков');
					// if (players.length) {
					// 	try {
					// 		await Promise.all(
					// 			players.map(async (player, index) => {
					// 				const gamer = await page.evaluate(player => {
					// 					const name =
					// 						player?.querySelector('.sc-gInZnl')?.innerText ||
					// 						'Not load';
					// 					let bet =
					// 						player?.querySelector('.sc-ACYlI')?.innerText || '0';
					// 					bet = Number(bet.split('.')[0].replace(/\D/gi, ''));
					// 					return {
					// 						name,
					// 						bet,
					// 					};
					// 				}, player);
					// 				// console.log(`Игрок №${index} ${gamer.name} ${gamer.bet} `);
					// 				playerLogs.push(
					// 					`Игрок №${index} ${gamer.name} ${gamer.bet} \n`,
					// 				);
					// 				if (gamer.name === '@PAVLOV_EVGEN') {
					// 					if (gamer.bet == 5000) {
					// 						betButtons[0]?.click();
					// 					} else if (gamer.bet == 10000) {
					// 						betButtons[1]?.click();
					// 					}
					// 					const date = new Date();
					// 					bot.sendMessage(`
					//   ${gamer.name} ${gamer.bet}\n
					//   ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}
					//   `);
					// 				}
					// 			}),
					// 		);
					// 	} catch (e) {
					// 		console.log(e);
					// 		console.log('Ошибка при работе Promise.all');
					// 	}
					// }
					// console.log('-------------------------------------------');
					// const getLogMessage = array => {
					// 	if (array && array.length) {
					// 		return array.join('');
					// 	}
					// 	return false;
					// };
					// const logMessage = getLogMessage(playerLogs);
					// if (logMessage) {
					// 	bot.sendMessage(logMessage);
					// 	playerLogs = [];
					// }

					await page.waitForFunction(
						selector => {
							const element = document.querySelector('.cTwCmb');
							return !!element;
						},
						{ timeout: 500000 },
						selector,
					);

					isLockInterval = false;
				}
			} catch (e) {
				console.log('client_loop: send disconnect: Connection reset');
				console.log(e);
			}
		}, 1);
	} catch (e) {
		console.log(e);
		console.log('App crashed');
		console.log('Reload App');
		throw new Error('App crashed');
	}
})();

app.listen(3000, () => {
	console.log('Сервер запущен на порту 3000');
});

//pm2 start index.js --max-restarts 3 --wait-ready
