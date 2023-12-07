const fs = require('fs');

class FileSystem {
	constructor() {
		this.date = {};
	}

	readFile(path, callback) {
		fs.readFile(filePath, 'utf8', (err, data) => {
			if (err) {
				console.error(`Ошибка чтения файла: ${err}`);
				return;
			}

			try {
				if (data) callback(data);
			} catch (parseError) {
				console.error('Ошибка парсинга JSON:', parseError);
			}
		});
	}

	writeFile(filePath, data) {
		if (!Array.isArray(this.date[filePath])) {
			this.date[filePath] = [];
		}

		if (this.date[filePath].length) return;

		fs.writeFile(filePath, data, 'utf8', err => {
			if (err) {
				console.error(`Ошибка записи файла: ${err}`);
				return;
			}

			this.date[filePath].push(new Date());
			setTimeout(() => {
				this.date[filePath] = [];
			}, 3000);
			console.log('Данные успешно записаны в файл.');
		});
	}
}
const fs = new FileSystem();
module.exports = fs;
