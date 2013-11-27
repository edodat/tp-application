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
var model = require('./models/model.js');


///////////////////
// CONFIGURATION //
///////////////////

// Express middleware configuration file
require('./config/express.js')(app, express);

// Converts all incoming "_id" string parameters to MongoDB ObjectIDs
app.param(['_id', 'user_id'], function(req, res, next, _id){
    req.params._id = model.ObjectId(_id);
    next();
});


/////////
// API //
/////////


// PUBLIC API //

app.get('/api/ping', function(req, res){ res.json({ connection : 'successful' });});
app.post('/api/sendactivationemail', controllers.activation.sendActivationEmail);
app.post('/api/activate', controllers.activation.activate);

app.post('/api/auth/login', controllers.auth.login);
app.post('/api/auth/reset', controllers.auth.reset);
app.post('/api/auth/set/validate', controllers.auth.validateResetToken);
app.post('/api/auth/set', controllers.auth.set);


// AUTHENTICATION CHECKPOINT //
// Routes defined AFTER the checkpoint will be authenticated.
// The checkpoint authenticates requests based on a token contained in the Authorization header field.
app.all('/api/*', controllers.auth.authenticateToken);

// PRIVATE API //

app.get('/api/users', controllers.users.getUsers);
app.post('/api/users', controllers.auth.checkIsAdmin(), controllers.users.createUser);
app.put('/api/users/:_id', controllers.auth.checkIsAdmin(), controllers.users.updateUser);
app.del('/api/users/:_id', controllers.auth.checkIsAdmin(), controllers.users.deleteUser);

app.get('/api/projects', controllers.projects.getProjects);
app.post('/api/projects',controllers.projects.createProject);
app.put('/api/projects/:_id', controllers.projects.updateProject);
app.del('/api/projects/:_id', controllers.projects.deleteProject);


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

