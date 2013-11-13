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
    bcrypt = require('bcrypt'),
    mail = require('../controllers/mail.js'),
    uuid = require('node-uuid').v4;

/////////////
// PRIVATE //
/////////////

var BCRYPT_ITERATIONS = 8;

/**
 * Utility function to hash a password/token
 * @param clear
 * @param callback
 */
function hash(clear, callback){
    bcrypt.hash(clear, BCRYPT_ITERATIONS, callback);
}


var RESET_TOKEN_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 10; // 10 days

/**
 * Creates and sends access link
 */
function sendAccess(user, isRenewal, callback){
    var tokenValue = uuid();
    var issueDate = new Date(),
        expirationDate = new Date(issueDate.getTime() + RESET_TOKEN_EXPIRATION_TIME);

    hash(tokenValue, function(err, hash) {
        if(err) return callback(new Error('Technical error before sending activation email'));

        var token = { tokenHash: hash, issueDate: issueDate, expirationDate: expirationDate };

        module.exports.update({ _id: user._id }, { $set: { resetToken: token } }, function(err){
            if(err) return callback(new Error('Technical error before sending activation email'));

            //TODO configurable links
            var accessLink = 'https://'+process.env.COMPANY+'.app.tp.com/#/login/'+user._id+'/'+tokenValue;
            // send mail
            mail.sendAccess(user.email, accessLink, isRenewal, function(err){
                if(err) return callback(new Error('Technical error while sending activation email'));
                console.log('[ADMIN] Access email sent for user', user.email);
                return callback(null);
            });
        });
    });
}

////////////
// PUBLIC //
////////////

model.declare(module.exports, 'users');

/**
 * Creates a user and sends access email.
 *
 * @param email
 * @param displayName
 * @param isAdmin
 * @param callback
 */
module.exports.create = function (email, displayName, isAdmin, callback){
    // check for unicity
    module.exports.findOne({ email: email }, function(err, duplicateUser){
        if (err) return callback(err);
        if (duplicateUser) {
            return callback(new Error('Email address already in use'));
        }

        var user = {};
        user.email = email;
        user.displayName = displayName;
        user.roles = [];
        if (isAdmin) user.roles.push('admin');

        // Save user to database
        module.exports.save(user, function(err){
            if (err) return callback(err);

            sendAccess(user, false, callback);
        });
    });
};



/**
 * Sets user's password (stores hash only)
 */
module.exports.setPassword = function(email, resetToken, password, callback){
    module.exports.findOne({ email: email }, function(err, user){
        if (err) return callback(err);
        if (!user) return callback(new Error('User not found'));

        // Step 1 : validate reset token
        module.exports.validateResetToken(user, resetToken, function(err, valid){
            if (err) return callback(err);
            if (!valid) return callback(new Error('Invalid reset token'));

            // Step 2 : store password
            hash(password, function(err, hash) {
                if (err) return callback(err);

                module.exports.update({ email: email }, { $unset: { resetToken: 1 }, $set: { passwordHash: hash } });
                return callback(null);
            });
        });
    });
}

/**
 * Resets user's password (sends password renewal email)
 */
module.exports.resetPassword = function(email, callback){
    module.exports.findOne({ email: email }, function(err, user){
        if (err) return callback(err);
        if (!user) return callback(new Error('User not found'));

        module.exports.update({ _id: user._id }, { $unset: { passwordHash: 1 } });
        sendAccess(user, true, callback);
    });
}

/**
 * Checks user's reset token
 */
module.exports.validateResetToken = function(user, resetToken, callback){
    if (!user.resetToken) return callback(null, false);

    var now = new Date();
    if (user.resetToken.expirationDate < now) return callback(null, false);

    bcrypt.compare(resetToken, user.resetToken.tokenHash, callback);
};

/**
 * Checks user's password
 */
module.exports.authenticatePassword = function(user, password, callback){
    if (!user.passwordHash) return callback(null, false);
    bcrypt.compare(password, user.passwordHash, callback);
};

/**
 * Checks user role
 * @param user
 * @param role
 */
module.exports.hasRole = function (user, role){
    return (user.roles.indexOf(role) > -1);
};

