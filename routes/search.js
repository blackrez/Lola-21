var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({log:'trace'});


/* GET users listing. */
router.get('/', function(req, res) {
	term = req.query.term;
	console.log(term);
	es.search(
		{
			body:
				{query:
					{query_string:{query:term}}
				}
		}).then(function (results){
			res.render('search.ejs', { title: 'Express', result: results.hits.hits});
		});
});

module.exports = router;