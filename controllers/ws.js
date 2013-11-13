/**
 * Web services client controller
 *
 * User: Etienne Dodat
 * Date: 30/10/13
 */

////////////////////
// INITIALIZATION //
////////////////////

var http = require('http'),
config = require('../config/ws.js');

/////////////
// PRIVATE //
/////////////

/**
 * Performs an HTTP POST to WS server
 * @param config (object) : WS server configuration (hostname, port)
 * @param path (string) : WS path
 * @param body (object) : WS request body
 * @param callback (function)
 */
function call(config, path, body, callback){
    var options = {
        hostname: config.hostname,
        port: config.port,
        path: path,
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
        //TODO auth, https ?
    };

    var req = http.request(options, function(res) {
        var data = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            if (res.statusCode == 200){
                callback(null, JSON.parse(data));
            } else {
                callback(new Error(JSON.parse(data).error));
            }
        });
    }).on('error', function(e) {
            console.log('[WS] Error on response :', e.message);
            callback(e);
        });

    // write data to request body
    req.write(JSON.stringify(body));
    req.end();
    console.log('[WS] Calling', path, 'on', config.hostname+':'+config.port);
}

////////////
// PUBLIC //
////////////

module.exports.admin = {

    sendActivationEmail : function(companyKey, callback){
        call(config.admin, '/ws/sendactivationemail', { company: companyKey }, callback);
    },

    activate : function(companyKey, token, callback){
        call(config.admin, '/ws/activate', { company: companyKey, token: token }, callback);
    }

};