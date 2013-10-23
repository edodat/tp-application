/**
 * Users management controller
 *
 * User: Etienne
 * Date: 15/09/13
 */

////////////////////
// INITIALIZATION //
////////////////////

var controller = require('./controller.js'),
    User = require('../models/user.js');

/////////////
// PRIVATE //
/////////////

////////////
// PUBLIC //
////////////

/**
 * Middleware to check authenticated user's required role
 */
module.exports.checkRole = function (role){
    return function (req, res, next){
        if (User.hasRole(req.user, role)){
            next();
        } else {
            controller.unauthorized(res, 'Insufficient rights');
        }
    };
};


/**
 * Creates a user
 */
module.exports.createUser = function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var isAdmin = req.body.admin?true:false;

    // check for unicity
    User.findOne({ $or: [ { username: username }, { email: email } ] }, function(err, duplicateUser){
        if (err) return controller.error(res, err);

        if (duplicateUser) {
            var duplicateField = (duplicateUser.email == email) ? 'Email address':'Username';
            return controller.error(res, new Error(duplicateField+' already in use'));
        }

        var user = {};
        user.email = email;
        user.username = username;
        user.roles = [];
        if (isAdmin) user.roles.push('admin');
        User.setPasswordHash(user, password, function(err){
            if (err) return controller.error(res, err);

            // Save user to database
            User.save(user, function(err){
                if (err) return controller.error(res, err);

                return controller.success(res, { user: user });
            });
        });
    });
};

