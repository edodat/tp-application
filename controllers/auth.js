/**
 * Authentication controller
 *
 * User: Etienne
 * Date: 10/09/13
 * Time: 15:36
 */


////////////////////
// INITIALIZATION //
////////////////////

var controller = require('./controller.js'),
    User = require('../models/user.js'),
    Token = require('../models/token.js'),
    async = require('async');

/////////////
// PRIVATE //
/////////////

////////////
// PUBLIC //
////////////

/**
 * Authenticates user with username and password.
 * If valid, returns user and token.
 * If invalid, returns 401.
 */
module.exports.login = function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password) {
        return controller.unauthorized(res, 'Missing credentials');
    }

    async.waterfall([
        // step 1 : retrieve user
        function (next){
            User.findOne({ username: username }, function(err, user){
                if (err) return controller.error(res, err);
                if (!user) return controller.unauthorized(res, 'Invalid credentials');
                next(null, user);
            });
        },
        // step 2 : check password
        function (user, next){
            User.authenticatePassword(user, password, function(err, valid){
                if (err) return controller.error(res, err);
                if (!valid) return controller.unauthorized(res, 'Invalid credentials');
                next(null, user);
            });
        },
        // step 3 : issue access token
        function (user, next){
            Token.issueToken(user, req.ip, function (err, token){
                if (err || !token) return controller.error(res, err);
                next(null, user, token);
            });
        }
    ], function (err, user, token){
            return controller.success(res, { user: user, token: token});
    });

/* without async:
    // step 1 : retrieve user
    User.findOne({ username: username }, function(err, user){
        if (err) return controller.error(res, err);

        if (!user) {
            return controller.unauthorized(res, 'Invalid credentials');
        }

        // step 2 : check password
        User.authenticatePassword(user, password, function(err, valid){
            if (err) return controller.error(res, err);

            if (!valid) {
                return controller.unauthorized(res, 'Invalid credentials');
            }

            // step 3 : issue access token
            Token.issueToken(user, req.ip, function (err, token){
                if (err || !token) return controller.error(res, err);

                return controller.success(res, { user: user, token: token});
            });
        });
    });
*/
};

/**
 * Middleware to validate access token (in Authorization header).
 * If invalid, returns 401.
 */
module.exports.authenticateToken = function (req, res, next) {
    var token = req.headers.authorization;

    if (!token) {
        return controller.unauthorized(res, 'Missing token');
    }

    // step 1 : validate token
    Token.authenticateToken(token, req.ip, function(err, userId){
        if (err) return controller.error(res, err);
        if (!userId) {
            return controller.unauthorized(res, 'Invalid token '+token);
        }

        // step 2 : retrieve user
        User.findById(userId, function(err, user){
            if (err) return controller.error(res, err);
            if (!user) {
                Token.revokeToken(token, 'User not found');
                return controller.unauthorized(res, 'User not found '+token);
            }

            // step 3 : attach user object to request
            req.user = user;
            next();
        });
    });
};
