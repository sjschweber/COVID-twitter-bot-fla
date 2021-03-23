var Twitter = require('twitter');
var config = require('./config.js');
const axios = require('axios');

var T = new Twitter(config)


T.post('statuses/update', {status: "This is a test!"}, function (err, res, data){
  console.log(data)
})
