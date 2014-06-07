var irc = require("irc");
var request = require('request');
var cheerio = require('cheerio');
var elasticsearch = require('elasticsearch');
var moment = require('moment');

var clientes = new elasticsearch.Client({log:'trace'});

config = {channel : '#lola21', nick : 'lola21'}
var client = new irc.Client("irc.freenode.net", config.nick, { channels: [config.channel],});

client.addListener("message", function(from, to, message) {
  if (message.indexOf('!last') == 0) {
    if (message.split(" ").length > 1){
      search = {
          match: {user:message.split(" ").pop()}
        }
    }
    else{
      search = {
          match_all: {}
        }
    }
    console.log(search);
    clientes.search({
      index:'bookmark',
      type:'link',
      size: 1,
      body: {
        sort : [{ "date" : {"order" : "desc"}},],
        query: search
      }
    }).then(function (resp) {
      if (resp.hits.total > 0){
        say = resp.hits.hits[0]._source;
        client.say(config.channel, say.url+ " posté par " + say.user);
      }
      else{
        client.say(config.channel, "Pas de liens pour cet utilisateur");
      }
    })
  }
  if (message.indexOf('!help') == 0) {
    client.say(config.channel, "Viens me rejoindre sur lola21.coagul.org/help");
  }
  if (message.indexOf('!link') == 0) {
    msgurl = message.slice(6);
    request(msgurl, function (error, response, body){
      if (error) {
        client.say(config.channel, "Une erreur est survenue");
        client.say(config.channel, error + " : statut " + msgurl);
      }
      else if (response.statusCode == 200) {
        console.log(response.statusCode);
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

                console.log(body);
                title = $('title').text();
                client.say(config.channel, title);
                if ($('meta[name=description]')[0] === undefined){
                  description = title;
                }
                else {
                  description = $('meta[name=description]')[0].attribs.content;
                }
                if (title == ''){
                  title = msgurl;
                }
                user = from;
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
          filename = response.req.path.split("/").pop();
          client.say(config.channel, filename);
          clientes.index({
            index: 'bookmark',
            type: 'link',
            body: {
              title: filename,
              mimetype: response.headers['content-type'],
              date: moment().format(),
              url: msgurl,
              user: from,
              content: response.headers['content-type'],
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