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
    User.find({}, { email:1, displayName:1, roles:1 }).sort({ displayName: 1 }, controller.wrapup(res));
}

/**
 * Creates a user
 */
module.exports.createUser = function(req, res){
    var email = req.body.email;
    var displayName = req.body.displayName;
    var isAdmin = req.body.admin?true:false;

    User.create(email, displayName, isAdmin, controller.wrapup(res));
};


