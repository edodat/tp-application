/**
 * Token management service
 *
 * Note : As tokens are not stored in database, this submodule does not extend Model.
 *
 * User: Etienne
 * Date: 13/09/13
 */

////////////////////
// INITIALIZATION //
////////////////////

var uuid = require('node-uuid').v4;

/////////////
// PRIVATE //
/////////////

var TOKEN_EXPIRATION_TIME = 1000 * 60 * 10; // 10 minutes
var EXPIRED_TOKENS_PURGE_TIME = 1000 * 86400; // 1 day
//TODO non-blocking background job to delete tokens with (expirationDate + EXPIRED_TOKENS_PURGE_TIME < now)

/**
 * Tokens memory-based repository
 */
var tokens = {};
var revokedTokens = {};

/**
 * Generates a token
 * @returns Token object
 */
function createToken (){
    var tokenValue = uuid();
    var issueDate = new Date(),
        expirationDate = new Date(issueDate.getTime() + TOKEN_EXPIRATION_TIME);
    var token = { value: tokenValue, issueDate: issueDate, expirationDate: expirationDate, accessCount: 0 };
    return token;
}

////////////
// PUBLIC //
////////////

/**
 * Issues token for user (and IP address)
 */
module.exports.issueToken = function(user, ip, callback){
    var token = createToken();
    token.ip = ip;
    token.user = user._id;

    tokens[token.value] = token;

    return callback(null, token.value);
};

/**
 * Authenticates token.
 * If token is valid, returns user ID.
 */
module.exports.authenticateToken = function(tokenValue, ip, callback){
    var token = tokens[tokenValue];

    if (!token){
        return callback(null, null);
    }

    if (token.ip != ip) {
        Token.revokeToken(tokenValue, 'Access attempt from '+ip);
        return callback(null, null);
    }

    var now = new Date();
    if (now > token.expirationDate) {
        return callback(null, null);
    }

    token.accessCount++;
    // extend expiration date on each access
    token.expirationDate = new Date(now.getTime() + TOKEN_EXPIRATION_TIME);
    // return user ID
    return callback(null, token.user);
};

/**
 * Revokes token.
 */
module.exports.revokeToken = function(tokenValue, message){
    var token = tokens[tokenValue];
    if (token) {
        token.revocationDate = new Date();
        token.revocationMessage = message;
        revokedTokens[tokenValue] = token;
        delete tokens[tokenValue];
    }
};
