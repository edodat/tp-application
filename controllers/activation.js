/**
 * Account activation controller
 *
 * User: Etienne Dodat
 * Date: 30/10/13
 */

////////////////////
// INITIALIZATION //
////////////////////

var controller = require('./controller.js'),
    User = require('../models/user.js'),
    ws = require('./ws.js');

/////////////
// PRIVATE //
/////////////

////////////
// PUBLIC //
////////////

module.exports.sendActivationEmail = function (req, res) {
    ws.admin.sendActivationEmail(process.env.COMPANY, controller.wrapup(res));
}

module.exports.activate = function (req, res) {
    var token = req.body.token;
    ws.admin.activate(process.env.COMPANY, token, function(err, data){
        if (err) return controller.error(res, err);

        // create first administrator account
        User.create(data.email, 'Administrator', true, controller.wrapup(res));
    });
};

