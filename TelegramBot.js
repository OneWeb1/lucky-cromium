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
			// console.log('Message sent successfully:', message);
		} catch (error) {
			console.log('Error sending message:', error);
		}
	}
}

module.exports = TelegramBot;
