/*
 * Module dependencies
 */
var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , http = require('http')
  , extend = require('node.extend')
  , yapi = require('yellowapi');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'))
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

var config = {
        apiKey: 'YOUR API KEY HERE'
      , uid: 'test'
      , lang: 'en'
      , useSandbox: true
    }
  , api = new yapi.YellowAPI(config);

app.get('/', function(req, res) {
  res.redirect('/business');
});

app.get('/:section', function(req, res) {
  res.render('index', { page: 'indexPage', section: req.params.section });
});

app.post('/:section/submit', function(req, res) {
  var url = '/' + req.params.section + '/';
  url += req.body.what + '/';
  url += req.body.where + '';

  res.redirect(url);
});

app.get('/:section/:what/:where', function(req, res) {
  api.findBusiness(req.params.what, req.params.where, 1, 15, '', function(response) {
    res.render('listing',
       { page: 'searchPage'
       , section: req.params.section
       , listings: response.listings
       , path: req.path
       }
     );
  }, function(error) {
    res.end(error);
  });
});

app.get('/bus/:prov/:city/:name/:id.html', function(req, res) {
  api.getBusinessDetails(req.params.prov, req.params.city, req.params.name, req.params.id, function(response) {
    res.render('details',
      { page: 'showPage'
      , section: 'business'
      , details: response
      }
    );
  });
});

app.listen(3000);
