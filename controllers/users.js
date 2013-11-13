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
 * Creates a user
 */
module.exports.createUser = function(req, res){
    var email = req.body.email;
    var displayName = req.body.displayName;
    var isAdmin = req.body.admin?true:false;

    User.create(email, displayName, isAdmin, controller.wrapup(res));
};


