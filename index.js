const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const helpers = require('./helpers');
const baseURL = 'https://hh.ru';

const app = express();

app.use(cors());

app.use(morgan('tiny'));



function getResults(body){
	const $ = cheerio.load(body);
	const vacansys = $('.vacancy-serp-item ');
	const results = [];

	vacansys.each((index, element) => {
		const result = $(element);
		const title = result.find('[data-qa="vacancy-serp__vacancy-title"]').text();
		const salary = result.find('[data-qa="vacancy-serp__vacancy-compensation"]').text();
		const link = result.find('a.bloko-link').attr('href');
		const employerRaw = result.find('a[data-qa="vacancy-serp__vacancy-employer"]');
		const employer = {
			name: employerRaw.text(),
			link: baseURL + employerRaw.attr('href')
		};
		const address = result.find('[data-qa="vacancy-serp__vacancy-address"]').text();
		const date = result.find('span.vacancy-serp-item__publication-date').text();

		results.push({
			title,
			salary,
			link,
			employer,
			address,
			date
		});
	})

	return results;
}

app.get('/', (request, response) => {
	response.json({
		message: "hello world"
	});
});


/**	params example
*	request.params.location : spb
*				  .vacancy: junior+developer
*				  .period: 3 (days)
**/
app.get('/search/:location/:period/:keyword', (request, response) => {

	const { location, keyword, period } = request.params;

	const url = `https://${location}.hh.ru/search/vacancy?search_period=${period}&clusters=true&area=2&text=${helpers.cyrillicEncode(keyword)}`;

	fetch(url)
		.then(response => response.text())
		.then(body => {
			const results = getResults(body);
			response.json({
				results
			});
		});
});

app.use((request, response, next) => {
	const error = new Error('not found');
	response.status(404);
	next(error);
});

app.use((error, request, response, next) => {
	response.status(response.statusCode || 500);
	response.json({
		message: error.message
	});
});

app.listen(5000, () => {
	console.log('listening on port 5000');
})
