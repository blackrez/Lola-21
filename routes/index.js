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
  		sort : [{ date : {"order" : "desc"}},],
    	query: {
      		match_all: {}
    	}
  	}
  }).then( function (results){
  	res.render('index', { title: 'Express', result: results.hits.hits});
  })
});



module.exports = router;
