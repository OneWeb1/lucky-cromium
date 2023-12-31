const chromium = require('chrome-aws-lambda');
const { watchReload } = require('./utils');

const launch = async () => {
	const browser = await chromium.puppeteer.launch({
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-accelerated-2d-canvas',
			'--no-first-run',
			'--no-zygote',
			'--start-maximized',
			// "--single-process",
			'--disable-gpu',
			'--display=:0',
		],
		defaultViewport: chromium.defaultViewport,
		executablePath: await chromium.executablePath,
		headless: false || chromium.headless,
		ignoreHTTPSErrors: false,
		protocolTimeout: 1000000,
		timeout: 0,
	});
	return browser;
};

const createPage = async (browser, url) => {
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

	try {
		await page.setDefaultNavigationTimeout(6000000);
	} catch (error) {
		await page.setDefaultNavigationTimeout(6000000);
	}

	await page.goto(url);

	return page;
};

module.exports = { launch, createPage };
