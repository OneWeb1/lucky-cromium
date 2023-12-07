const fs = require('fs');

class FileSystem {
	constructor() {
		this.date = {};
	}

	readFile(path, callback) {
		fs.readFile(path, 'utf8', (err, data) => {
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

	writeFile(path, data) {
		if (!Array.isArray(this.date[path])) {
			this.date[path] = [];
		}

		if (this.date[path].length) return;

		fs.writeFile(path, data, 'utf8', err => {
			if (err) {
				console.error(`Ошибка записи файла: ${err}`);
				return;
			}

			this.date[path].push(new Date());
			setTimeout(() => {
				this.date[path] = [];
			}, 5000);
			console.log('Данные успешно записаны в файл.');
		});
	}
}
const fileSystem = new FileSystem();
module.exports = fileSystem;
