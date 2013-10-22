/**
 * Node application launcher script with cluster support.
 *
 * This script launches app.js in children processes.
 *
 * Installation : put this script in the same directory than app.js.
 *
 * Parameters (usage: $ PARAM=VALUE node cluster-app.js) :
 *  NUM_PROC (optional) :   number of child processes created.
 *                          By default, cluster-app will use the number of CPUs for optimal resource usage.
 *
 *  Note : cluster-app will maintain the same number of children processes (automatic respawn).
 *  Note : all other parameters (eg: PORT) will be passed to app.js children processes.
 *
 * User: Etienne Dodat
 * Date: 06/09/13
 */

/*
 TODO
 Local memory-based storage seems a problem with clusterized node applications (multiple processes in parallel)
 since child processes don’t share memory. It is still possible to “sync” data between child processes
 using process.send from a child and worker.send from the master to broadcast info.
 */

var cluster = require('cluster');

// Child processes will execute app.js
cluster.setupMaster({
    exec : "app.js"
});


// Fork initial workers
var numCPUs = require('os').cpus().length;
var numProc = process.env.NUM_PROC || numCPUs;
for (var i = 0; i < numProc; i++) {
    var worker = cluster.fork();
}

/**
 * Listener called when a worker is ready to receive requests.
 */
cluster.on('listening', function(worker, address) {
    console.log('[CLUSTER] Worker', worker.id, 'listening on port', address.port);
    // Perform actions after worker startup
});

/**
 * Listener called when a worker is terminated.
 */
cluster.on('exit', function(worker, code, signal) {
    // Perform actions after worker died
    if( signal ) {
        console.log('[CLUSTER] Worker', worker.id, 'was killed by signal', signal, '=> restarting...');
    } else if( code !== 0 ) {
        console.log('[CLUSTER] Worker', worker.id, 'exited with error code', code, '=> restarting...');
    } else {
        console.log('[CLUSTER] Worker', worker.id, 'exited with code 0 => restarting...');
    }
    // Respawn automatically
    setTimeout(cluster.fork(), 1000); // timeout to prevent CPU explosion if worker is crashing too fast
});

/**
 * Listener called when receiving a SIGINT signal (usually a Ctrl-C).
 */
process.on('SIGINT', function() {
    console.log('[CLUSTER] Received SIGINT signal');
    // Perform actions (asynchronous or not) before calling process.exit() to terminate program.
    process.exit();
});

/**
 * Listener called when receiving a SIGTERM signal (usually a "kill").
 */
process.on('SIGTERM', function() {
    console.log('[CLUSTER] Received SIGTERM signal');
    // Perform actions (asynchronous or not) before calling process.exit() to terminate program.
    process.exit();
});

/**
 * Listener called when master process is exiting (either with SIGINT, SIGTERM or programmatically).
 */
process.on('exit', function() {
    // Do cleanup before exit.
    // Note: asynchronous tasks won't be executed.
});

