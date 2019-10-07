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
    try {
      console.log(chalk.grey('Received request:',req.url, req.headers));
      if(req.url && req.url.includes('/pbi-cluster')){
        const finalUrl = 'https://wabi-west-europe-d-primary-redirect.analysis.windows.net' + req.url.replace('/pbi-cluster','');
        console.log(chalk.brown('Request Proxied -> ' + finalUrl));
        req.pipe(request(finalUrl)).pipe(res);
      } else if((req.header('Referer') && ( req.header('Referer').includes('/reportEmbed?groupId=') || req.header('Referer').includes('reportembed.bundle.min.css') ) ) || 
          (req.url && req.url.includes('/reportEmbed?groupId='))){
        const finalUrl = cleanProxyUrl + req.url;
        console.log(chalk.green('Request Proxied -> ' + finalUrl));
        req.pipe(request(finalUrl)).pipe(res);      
      }
      else {
        const finalUrl = 'http://localhost:3000' + req.url;
        console.log(chalk.yellow('Request Served -> ' + finalUrl));
        //staticWebserver(req, res, next);
        req.pipe(request(finalUrl)).pipe(res);  
      }
    }
    catch (e) {}
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
