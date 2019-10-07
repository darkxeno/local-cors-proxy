var express = require('express');
var request = require('request');
var cors = require('cors');
var chalk = require('chalk');
var proxy = express();

const staticWebserver = express.static(process.cwd());

var startProxy = function(port, proxyUrl, proxyPartial) {
  proxy.use(cors());
  proxy.options('*', cors());

  // remove trailing slash
  var cleanProxyUrl = proxyUrl.replace(/\/$/, '');
  // remove all forward slashes
  var cleanProxyPartial = proxyPartial.replace(/\//g, '');

  proxy.use('/' + cleanProxyPartial, function(req, res, next) {

    if((req.header('Referer') && ( req.header('Referer').includes('/reportEmbed?groupId=') || req.header('Referer').includes('reportembed.bundle.min.css') ) ) || 
        (req.url && req.url.includes('/reportEmbed?groupId='))){
      try {
        console.log(chalk.green('Request Proxied -> ' + req.url));
      } catch (e) {}      
      req.pipe(request(cleanProxyUrl + req.url)).pipe(res);      
    }
    else {
      try {
        console.log(chalk.yellow('Request Served -> ' + req.url));
      } catch (e) {}       
      //staticWebserver(req, res, next);
      req.pipe(request('http://localhost:3000' + req.url)).pipe(res);  
    }
  });
 
  proxy.listen(port);

  // Welcome Message
  console.log(chalk.bgGreen.black.bold.underline('\n Proxy Active \n'));
  console.log(chalk.blue('Proxy Url: ' + chalk.green(cleanProxyUrl)));
  console.log(chalk.blue('Proxy Partial: ' + chalk.green(cleanProxyPartial)));
  console.log(chalk.blue('PORT: ' + chalk.green(port) + '\n'));
  console.log(
    chalk.cyan(
      'To start using the proxy simply replace the proxied part of your url with: ' +
        chalk.bold('http://localhost:' + port + '/' + cleanProxyPartial + '\n')
    )
  );
};

exports.startProxy = startProxy;
