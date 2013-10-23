/**
 * User model class
 *
 * User: Etienne
 * Date: 11/09/13
 * Time: 12:00
 */

////////////////////
// INITIALIZATION //
////////////////////

var model = require('./model.js'),
    bcrypt = require('bcrypt');

/////////////
// PRIVATE //
/////////////

var BCRYPT_ITERATIONS = 8;

////////////
// PUBLIC //
////////////

model.declare(module.exports, 'users');

/**
 * Checks user's password
 *
 * @param password
 * @returns {boolean}
 */
module.exports.authenticatePassword = function(user, password, callback){
    bcrypt.compare(password, user.passwordHash, callback);
};

/**
 * Sets user's password (stores hash only)
 * @param password
 * @param callback
 */
module.exports.setPasswordHash = function(user, password, callback){
    bcrypt.hash(password, BCRYPT_ITERATIONS, function(err, hash) {
        if (err) return callback(err);
        user.passwordHash = hash;
        return callback(null, hash);
    });
}

/**
 * Checks user role
 * @param user
 * @param role
 */
module.exports.hasRole = function (user, role){
    return (user.roles.indexOf(role) > -1);
};

