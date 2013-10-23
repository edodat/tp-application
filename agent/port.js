/**
 * Helper function to find available port
 *
 * User: Etienne Dodat
 * Date: 04/10/13
 */

////////////////////
// INITIALIZATION //
////////////////////

var net = require('net');

/////////////
// PRIVATE //
/////////////

////////////
// PUBLIC //
////////////

module.exports.getAvailablePort = function (callback) {
    var server = net.createServer(),
        port = 0;
    server.on('listening', function() {
        // Found it! Close server.
        port = server.address().port;
        server.close();
    })
    server.on('close', function() {
        // Report.
        callback(null, port);
    })
    server.on('error', function() {
        callback(new Error('Failed to connection attempt to available port'));
    })
    // open server on random port
    server.listen(0);
};
