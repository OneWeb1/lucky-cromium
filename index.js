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

		setInterval(() => {
			const date = new Date();
			bot.sendMessage(
				`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
			);
		}, 20000);
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
