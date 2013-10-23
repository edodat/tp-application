/**
 * Bus controller for APP agent
 *
 * User: Etienne
 * Date: 04/10/13
 */

////////////////////
// INITIALIZATION //
////////////////////

var amqp = require('amqp'),
    config = require('../config/amqp.js');

/////////////
// PRIVATE //
/////////////

var connection;
var adminExchange;
var queue;
var listeners = {};

/**
 * Initializes bus connection, exchanges and queue.
 * @param callback
 */
function initialize (callback){
    // Connect to bus
    connection = amqp.createConnection({ url: config.connectionURL });
    connection.on('ready', function() {
        console.log('[BUS] Connected to ' + connection.serverProperties.product);

        // declare "administration" AMQP exchange
        adminExchange = connection.exchange('administration', {
            type: 'topic',
            durable: 'true'
        });

        // declare agent-specific queue (named with agent hostname)
        queue = connection.queue(process.env.HOSTNAME, function(q){
            // Receive messages
            q.subscribe(function (message, headers, deliveryInfo) {
                console.log('[BUS] Received', deliveryInfo.routingKey, 'message:', message);
                var cb = listeners[deliveryInfo.routingKey];
                if (cb){
                    cb(message);
                } else {
                    console.log('[BUS] Routing key', deliveryInfo.routingKey, 'not handled. Message discarded.');
                }
            });

            callback(null);
        });
    });
}

/**
 * Publishes a message to the bus.
 * @param routingKey
 * @param message
 */
function publish (routingKey, message){
    console.log('[BUS] Publishing', routingKey, 'message:', message);
    adminExchange.publish(routingKey, message);
}

////////////
// PUBLIC //
////////////

/**
 * Initializes bus connection, exchanges and queue.
 * @param callback
 */
module.exports.initialize = initialize;

/**
 * Closes connection.
 */
module.exports.close = function(){
    connection.end();
};

/**
 * Binds a listener to incoming bus messages.
 * @param routingKey
 * @param callback
 */
module.exports.on = function (routingKey, callback){
    queue.bind(adminExchange, routingKey);
    listeners[routingKey] = callback;
    console.log('[BUS] Listening to', routingKey, 'messages');
}

/**
 * Publishes a message on startup (instructs admin to provide agent info)
 */
module.exports.discover = function(){
    publish('agent.discover', { host: process.env.HOSTNAME });
};

/**
 * Publishes a message with company information
 */
module.exports.publishCompany = function(companyInfo){
    companyInfo.host = process.env.HOSTNAME;
    publish('agent.company', companyInfo);
};

/**
 * Publishes a message when agent shuts down
 */
module.exports.publishShutdown = function(){
    publish('agent.shutdown', { host: process.env.HOSTNAME });
};

