module.exports = {
	apps: [
		{
			script: 'index.js',
			watch: true,
			ignore_watch: ['node_modules'],
			max_memory_restart: '900M',
		},
	],
};
