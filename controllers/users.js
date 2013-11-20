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
 * Retrieves users
 */
module.exports.getUsers = function(req, res){
    User.find({}, { email:1, displayName:1, isAdmin:1 }).sort({ displayName: 1 }, controller.wrapup(res));
}

/**
 * Creates a user
 */
module.exports.createUser = function(req, res){
    var email = req.body.email;
    var displayName = req.body.displayName;
    var isAdmin = req.body.isAdmin?true:false;

    User.create(email, displayName, isAdmin, controller.wrapup(res));
};

/**
 * Updates a user
 */
module.exports.updateUser = function(req, res){
    var _id = req.params._id;
    var email = req.body.email;
    var displayName = req.body.displayName;
    var isAdmin = req.body.isAdmin?true:false;

    User.updateUser(_id, email, displayName, isAdmin, controller.wrapup(res));
};

/**
 * Deletes a user
 */
module.exports.deleteUser = function(req, res){
    var _id = req.params._id;

    if (String(_id) == String(req.user._id)) {
        return controller.error(res, new Error('A user cannot delete himself'));
    }

    User.remove({ _id: _id });
    return controller.success(res);
};


