var express = require('express');
var elasticsearch = require('elasticsearch');
var moment = require('moment');

var router = express.Router();
var es = new elasticsearch.Client({log:'trace'});
var RSS = require('rss');



router.get('/', function(req, res) {

    // Initializing feed object
    var feedOptions = {
        title:          'My Feed Title',
        description:    'This is my personnal feed!',
        link:           'http://example.com/',
        image:          'http://example.com/logo.png',
        copyright:      'Copyright © 2013 John Doe. All rights reserved',

        author: {
            name:       'John Doe',
            email:      'john.doe@example.com',
            link:       'https://example.com/john-doe'
        }
    };
    var feed = new RSS(feedOptions);

    // Function requesting the last 5 posts to a database. This is just an
    // example, use the way you prefer to get your posts.
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
        results = results.hits.hits;
            for(var key in results) {
                item = results[key]._source;
                console.log(item.url);
                feed.item({
                    gid: item._id, 
                    title:          item.title,
                    url:           item.url,
                    description:    item.content,
                    date:           moment(item.date).toDate()
                });
            }
            // Setting the appropriate Content-Type
            res.set('Content-Type', 'text/xml');

            // Sending the feed as a response
            res.send(feed.xml());
    })
});

module.exports = router;
