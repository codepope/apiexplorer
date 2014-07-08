var util = require('util');
var Client = require('node-rest-client').Client;
var Access = require('./accesstoken.js');
var baseURL = "https://beta-api.mongohq.com";

var headers = {
  "Content-Type": "application-json",
  "Accept-Version": "2014-06",
  "Authorization": "Bearer " + Access.accessToken()
}
var httpArgs = {
  "headers": headers
}

client = new Client();

var express = require("express");
var exphbs = require("express3-handlebars")
var app = express();
var server = require("http").createServer(app);
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.get('/', function(req, res) {
  // enumerate the accounts for this user
  client.get(util.format("%s/accounts", baseURL), httpArgs, function(accounts,
    response) {
    if (response.statusCode != 200) {
      if (accounts.hasOwnProperty("error")) {
        res.send(accounts.error);
      } else {
        res.send(response.headers.status);
      }
      return;
    }
    res.render("accounts", { "accounts": accounts });
  });

});

app.get('/deployments/:account_slug', function(req, res) {
  account_slug = req.param("account_slug");
  client.get(util.format("%s/accounts/%s/deployments", baseURL, account_slug),
    httpArgs,
    function(deployments, response) {
      res.render("deployments", {
        "account_slug": account_slug,
        "deployments": deployments
      });
    })
});

app.get('/database/stats/:account_slug/:deployment_id/:database_name', function(
  req, res) {
  account_slug = req.param("account_slug");
  deployment_id = req.param("deployment_id");
  database_name = req.param("database_name");
  client.get(util.format("%s/deployments/%s/%s/mongodb/%s/stats", baseURL,
      account_slug, deployment_id, database_name), httpArgs,
    function(stats, response) {
      res.render("stats", {
        "account_slug": account_slug,
        "deployment_id": deployment_id,
        "database_name": database_name,
        "stats": stats
      });
    });
})

app.get('/database/backups/:account_slug/:deployment_id', function(
  req, res) {
  account_slug = req.param("account_slug");
  deployment_id = req.param("deployment_id");
  client.get(util.format("%s/deployments/%s/%s/backups", baseURL,
      account_slug, deployment_id), httpArgs,
    function(backups, response) {
      res.render("backups", {
        "account_slug": account_slug,
        "deployment_id": deployment_id,
        "backups": backups
      });
    });
})

server.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
