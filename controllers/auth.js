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
    Access = require('../models/access.js');

/////////////
// PRIVATE //
/////////////

////////////
// PUBLIC //
////////////

/**
 * Authenticates user with email and password.
 * If valid, returns token.
 * If invalid, returns 401.
 */
module.exports.login = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
        return controller.unauthorized(res, 'Missing credentials');
    }

    // step 1 : retrieve user
    User.findOne({ email: email }, function(err, user){
        if (err) return controller.error(res, err);
        if (!user) return controller.unauthorized(res, 'Invalid credentials');

        // step 2 : check password
        User.authenticatePassword(user, password, function(err, valid){
            if (err) return controller.error(res, err);
            if (!valid) return controller.unauthorized(res, 'Invalid credentials');

            // step 3 : issue access token
            Token.issueToken(user, req.ip, function(err, token){
                if (err) return controller.error(res, err);

                Access.log(user, req.ip);

                return controller.success(res, {
                    token: token,
                    user: {
                        _id: user._id,
                        email: user.email,
                        displayName: user.displayName,
                        isAdmin: user.isAdmin
                    }
                });
            });
        });
    });
};

/**
 * Sets user's password
 */
module.exports.set = function(req, res){
    var email = req.body.email;
    var resetToken = req.body.token;
    var password = req.body.password;

    User.setPassword(email, resetToken, password, controller.wrapup(res));
}

/**
 * Validates Reset Password token and returns user's credential (email)
 */
module.exports.validateResetToken = function(req, res){
    var userId = req.body.user;
    var resetToken = req.body.token;

    User.findById(userId, function(err, user){
        if (err) return controller.error(res, err);
        if (!user) return controller.error(res, new Error('User not found'));

        User.validateResetToken(user, resetToken, function(err, valid){
            if (err) return controller.error(res, err);
            if (!valid) return controller.error(res, new Error('Invalid token'));

            return controller.success(res, { email: user.email });
        });
    });
}

/**
 * Resets user's password and sends password renewal link
 */
module.exports.reset = function(req, res){
    var email = req.body.email;
    User.resetPassword(email, controller.wrapup(res));
}

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

/**
 * Middleware to check authenticated user's required role
 */
module.exports.checkIsAdmin = function (){
    return function (req, res, next){
        if (User.isAdmin(req.user)){
            next();
        } else {
            controller.unauthorized(res, 'Insufficient rights');
        }
    };
};

