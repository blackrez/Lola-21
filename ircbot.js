var irc = require("irc");
var request = require('request');
var cheerio = require('cheerio');
var elasticsearch = require('elasticsearch');
var moment = require('moment');

var clientes = new elasticsearch.Client({log:'trace'});

config = {channel : '#lola21', nick : 'lola21'}
var client = new irc.Client("irc.freenode.net", config.nick, { channels: [config.channel],});

client.addListener("message", function(from, to, message) {
	if (message.indexOf('!link') == 0) {
		msgurl = message.slice(6);
		request(msgurl, function (error, response, body){
			console.log(response);
			if (error) {
				client.say(config.channel, "Une erreur est survenue");
				client.say(config.channel, error + " : statut %" + msgurl);
			}
			else if (response.statusCode == 200) {
				if (response.headers['content-type'].search('text/html') == 0) {
					//msgurl = msgurl.replace("http://","");
					//msgurl = msgurl.replace("https://", "");
					clientes.search({
						index:'bookmark',
						type:'link',
						body:
							{query:
								{term:
									{'url':msgurl}
								}
						
							}
					}).then(function (resp){
						if (resp.hits.total < 1) {
								$ = cheerio.load(body);
								description = $('meta[name=description]')[0].attribs.content;
								title = $('title').text();
								user = from;
								client.say(config.channel, title);
								console.log(description);

								clientes.index({
									index: 'bookmark',
									type: 'link',
									body: {
										title: title,
										content: description,
										date: moment().format(),
										url: msgurl,
										user: from
									}
								})
						}
						else {
							client.say(config.channel, from + ' mon petit chou, ton lien a déjà été posté.');
						}
					})
				}
				else {
					clientes.index({
						index: 'bookmark',
						type: 'link',
						body: {
							title: title,
							mimetype: response.headers['content-type'],
							date: Date(Date.now()),
							url: msgurl
						}
					})
				}
			}
		})
	}
});

client.addListener('error', function(message) {
    console.log('error: ', message);
});