/**
 * Main application script
 *
 * Environment variables (usage: Set env vars or $ PARAM=VALUE node app.js) :
 *  - COMPANY (required)
 *  - PORT (optional)
 *
 * User: Etienne Dodat
 * Date: 29/08/13
 */

////////////////////
// INITIALIZATION //
////////////////////

if (! process.env.COMPANY) {
    console.error('[APP] COMPANY environment variable not set. Process will exit.');
    process.exit(0);
}

var http = require('http'),
    express = require('express'),
    app = express();

var controllers = require('./controllers');
var Model = require('./models/model.js');


///////////////////
// CONFIGURATION //
///////////////////

// Express middleware configuration file
require('./config/express.js')(app, express);

// Converts all incoming "_id" string parameters to MongoDB ObjectIDs
app.param(['_id', 'user_id'], function(req, res, next, _id){
    req.params._id = Model.ObjectId(_id);
    next();
});


////////////
// ROUTES //
////////////

// PUBLIC ROUTES //

app.post('/login', controllers.auth.login);


// AUTHENTICATION CHECKPOINT //
// Routes defined AFTER the checkpoint will be authenticated.
// The checkpoint authenticates requests based on a token contained in the Authorization header field.
app.all('*', controllers.auth.authenticateToken);

// PRIVATE ROUTES //

// ping
app.get('/', function(req, res){ res.json({ connection : 'successful' });});

// create user
app.post('/user', controllers.users.checkRole('admin'), controllers.users.createUser);


//////////////////
// START SERVER //
//////////////////

var server = http.createServer(app);
server.listen(process.env.PORT || 80, function(){
    console.log('[APP] Server listening on port ' + server.address().port);
});


///////////////////////////
// PUT SERVER ON STANDBY //
///////////////////////////

function standby() {
    console.log('[APP] Closing server for standby');
    server.close(function(){
        console.log('[APP] Exiting process for standby');
        process.exit(0);
    });
}

// The cluster master process can instruct this server to standby with "worker.send('standby')".
process.on('message', function(msg) {
    if (msg === 'standby') standby();
});

process.on('SIGINT', function() {
    console.log('[APP] Received SIGINT signal');
    standby();
});

process.on('SIGTERM', function() {
    console.log('[APP] Received SIGTERM signal');
    standby();
});

//TODO when all tokens are expired (use setInterval), call standby to stop process

