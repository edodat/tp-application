/**
 * Cluster-based APP launcher agent.
 *
 * - Declares itself on the service bus.
 * - Launches app.js in child processes (workers) when requested through the service bus.
 * - Respawns processes that fail.
 *
 * Environment variables (usage: Set env vars or $ PARAM=VALUE node app-agent.js) :
 *  - HOSTNAME (required) : private hostname of the server (will be used by Proxy)
 *
 * User: Etienne Dodat
 * Date: 02/10/13
 */

////////////////////
// INITIALIZATION //
////////////////////

// Checks environment configuration
require('./agent/env.js');

if (! process.env.HOSTNAME) {
    console.error('[AGENT] HOSTNAME environment variable not set. Process will exit.');
    process.exit(0);
}

var cluster = require('cluster'),
    workers = require('./agent/workers.js'),
    bus = require('./agent/bus.js');


////////////////////////
// CLUSTER MANAGEMENT //
////////////////////////

// Child processes will execute app.js
cluster.setupMaster({
    exec : "app.js"
});

/**
 * Listener called when an APP child process is ready to receive requests.
 */
cluster.on('listening', workers.onListening);

/**
 * Listener called when an APP child process is terminated.
 */
cluster.on('exit', workers.onExit);

/**
 * Listener called when receiving a SIGINT signal (usually a Ctrl-C).
 */
process.on('SIGINT', function() {
    console.log('[AGENT] Received SIGINT signal');
    workers.shutdown(function(){
        process.exit();
    });
});

/**
 * Listener called when receiving a SIGTERM signal (usually a "kill").
 */
process.on('SIGTERM', function() {
    console.log('[AGENT] Received SIGTERM signal');
    workers.shutdown(function(){
        process.exit();
    });
});

/**
 * Listener called when agent process (master) is exiting (either with SIGINT, SIGTERM or programmatically).
 */
process.on('exit', function() {
    bus.publishShutdown();
    bus.close();
});

///////////////////////////
// SERVICE BUS LISTENERS //
///////////////////////////

bus.initialize(function(err){
    if (err) {
        console.error('[AGENT] Bus initialization failed:', err);
        process.exit(0);
    }

    // Agents declares itself on discovery request
    bus.on('admin.discover', workers.declare);
    bus.on('proxy.discover', workers.declare);

    bus.on('admin.agent', function(message){
        if (message.host == process.env.HOSTNAME){
            workers.bind(message.company);
        }
    });

    bus.on('admin.run', function(message){
        if (message.host == process.env.HOSTNAME){
            workers.run(message.company);
        }
    });
    bus.on('proxy.run', function(message){
        if (message.host == process.env.HOSTNAME){
            workers.run(message.company);
        }
    });

    bus.on('admin.standby', function(message){
        if (message.host == process.env.HOSTNAME){
            workers.standby(message.company);
        }
    });

    bus.on('admin.shutdown', function(message){
        if (message.host == process.env.HOSTNAME){
            workers.shutdown(function(){
                process.exit();
            });
        }
    });

    bus.discover();
});
