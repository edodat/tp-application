/**
 * Main application script
 *
 * User: Etienne Dodat
 * Date: 29/08/13
 */

////////////////////
// INITIALIZATION //
////////////////////

var http = require('http'),
    express = require('express'),
    app = express();


///////////////////
// CONFIGURATION //
///////////////////

app.configure('all', function() {
    app.enable('trust proxy')
    var swig = require('swig');
    app.engine('.html', swig.renderFile);
    app.set('view engine', 'html');
    app.set('views', __dirname+'/views');
});

app.configure('development', function() {
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(__dirname+'/public'));
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function() {
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(__dirname+'/public'));
    app.use(express.errorHandler());
});

////////////
// ROUTES //
////////////


//////////////////
// START SERVER //
//////////////////

var server = http.createServer(app);
server.listen(process.env.PORT || 80, function(){
    console.log('Server listening on port ' + server.address().port);
});
