var express = require('express');
var elasticsearch = require('elasticsearch');

var router = express.Router();
var es = new elasticsearch.Client({log:'trace'});

/* GET home page. */
router.get('/', function(req, res) {
  es.search({
  	index: 'bookmark',
  	type: 'link',
  	size: 50,
  	body: {
  		sort : [{ date : {"order" : "asc"}},],
    	query: {
      		match_all: {}
    	}
  	}
  }).then( function (response){
  	console.log(response.hits.hits);
  	res.render('index', { title: 'Express', result: response.hits.hits});
  })
});



module.exports = router;
