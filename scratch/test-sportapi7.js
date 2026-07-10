const http = require('https');

const options = {
	method: 'GET',
	hostname: 'sportapi7.p.rapidapi.com',
	port: null,
	path: '/api/v1/category/1/scheduled-events/2024-05-03', // using a past date to ensure data
	headers: {
		'x-rapidapi-key': '90c9fd4cb7msh5f21720fd5a3961p1a29d4jsnb8258d17ca96',
		'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
		'Content-Type': 'application/json'
	}
};

const req = http.request(options, function (res) {
	const chunks = [];

	res.on('data', function (chunk) {
		chunks.push(chunk);
	});

	res.on('end', function () {
		const body = Buffer.concat(chunks);
		console.log(body.toString());
	});
});

req.end();
