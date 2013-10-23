/**
 * Cluster workers controller
 *
 * User: Etienne Dodat
 * Date: 04/10/13
 */

////////////////////
// INITIALIZATION //
////////////////////

var cluster = require('cluster'),
    port = require('./port.js'),
    bus = require('./bus.js');

/////////////
// PRIVATE //
/////////////

// Stores info about associated companies
var companiesInfo = {};

function findWorkerByCompany(companyKey){
    var companyInfo = companiesInfo[companyKey];
    if (companyInfo && companyInfo.worker) {
        return cluster.workers[companyInfo.worker];
    } else {
        return null;
    }
}

function findCompanyByWorker(id){
    for (var company in companiesInfo){
        if (companiesInfo[company].worker == id) return company;
    }
}

function standbyWorker(worker){
    // make sure we close down within 60 seconds
    var timeout = setTimeout(function() {
        console.log('[AGENT] Killing APP worker', worker.id);
        worker.kill();
    }, 60000);
    worker.on('disconnect', function() {
        clearTimeout(timeout);
    });
    // graceful kill
    console.log('[AGENT] Disconnecting APP worker', worker.id);
    worker.send('standby');
}

function loopUntilNoWorkers(callback){
    return function(){
        if (cluster.workers.length > 0){
            setTimeout(loopUntilNoWorkers(callback), 1000);
        } else {
            callback();
        }
    };
}

////////////
// PUBLIC //
////////////

/**
 * Declares agent and associated companies on the bus.
 */
module.exports.declare = function(){
    for (var companyKey in companiesInfo) {
        bus.publishCompany(companiesInfo[companyKey]);
    }
};

/**
 * Binds a company to agent.
 */
module.exports.bind = function(companyKey){
    if (!companiesInfo[companyKey]) {
        companiesInfo[companyKey] = { company: companyKey, status: 'standby' };
    }
    bus.publishCompany(companiesInfo[companyKey]);
};

/**
 * Instantiates an APP child process for a company.
 * @param companyKey
 */
module.exports.run = function (companyKey){
    //TODO ensure more strictly that 2 workers cannot run for the same company (if this function is called almost simultaneously)

    if (!companiesInfo[companyKey]){
        console.log('[AGENT] Agent not bound with company', companyKey);
        return;
    }
    if (findWorkerByCompany(companyKey)){
        console.log('[AGENT] Worker already running for company', companyKey);
        return;
    }

    port.getAvailablePort(function(err, port){
        if (port){
            // Start worker
            var worker = cluster.fork({ PORT: port, COMPANY: companyKey });
            console.log('[AGENT] Forking APP worker', worker.id, 'on port',port,'for company', companyKey);

            companiesInfo[companyKey].worker = worker.id;
            companiesInfo[companyKey].status = 'starting';
            companiesInfo[companyKey].port = port;
            // Publish to bus
            bus.publishCompany(companiesInfo[companyKey]);

            // Start timer
            console.time('[AGENT] APP worker '+worker.id+' startup time');
        }
        //TODO else handle error
    });
};

/**
 * Listener called when an APP child process is ready to receive requests.
 */
module.exports.onListening = function(worker, address) {
    var companyKey = findCompanyByWorker(worker.id);
    var port = address.port;

    console.log('[AGENT] Worker', worker.id, 'listening on port', address.port, 'for company', companyKey);
    // Stop timer
    console.timeEnd('[AGENT] APP worker '+worker.id+' startup time');

    companiesInfo[companyKey].status = 'running';
    companiesInfo[companyKey].port = address.port;
    // Publish to bus
    bus.publishCompany(companiesInfo[companyKey]);;
};


/**
 * Terminates an APP child process for a company.
 * @param companyKey
 */
module.exports.standby = function (companyKey){
    var worker = findWorkerByCompany(companyKey);
    if (worker) {
        standbyWorker(worker);
    } else {
        console.log('[AGENT] No worker found for company', companyKey);
    }
};

/**
 * Terminates all APP child processes.
 * @param companyKey
 */
module.exports.shutdown = function (callback){
    for (var id in cluster.workers) {
        standbyWorker(cluster.workers[id]);
    }
    setTimeout(loopUntilNoWorkers(callback), 1000);
};

/**
 * Listener called when an APP child process is terminated.
 */
module.exports.onExit = function(worker, code, signal) {
    var companyKey = findCompanyByWorker(worker.id);
    delete companiesInfo[companyKey].worker;
    delete companiesInfo[companyKey].port;

    if( signal ) {
        console.log('[AGENT] Worker', worker.id, 'for company', companyKey, 'was killed by signal', signal);
        companiesInfo[companyKey].status = 'crashed';
    } else if( code !== 0 ) {
        console.log('[AGENT] Worker', worker.id, 'for company', companyKey, 'exited with error code', code, '=> restarting...');
        companiesInfo[companyKey].status = 'crashed';
        // Respawn automatically
        setTimeout(module.exports.run(companyKey), 1000); // timeout to prevent CPU explosion if crashing too fast
    } else {
        console.log('[AGENT] Worker', worker.id, 'for company', companyKey, 'put on standby');
        companiesInfo[companyKey].status = 'standby';
    }
    // Publish to bus
    bus.publishCompany(companiesInfo[companyKey]);
};
