/**
 * Access logs model
 *
 * User: Etienne Dodat
 * Date: 13/11/13
 */

////////////////////
// INITIALIZATION //
////////////////////

var model = require('./model.js');

/////////////
// PRIVATE //
/////////////

////////////
// PUBLIC //
////////////

model.declare(module.exports, 'access');

module.exports.log = function (user, ip){
    var now = new Date();
    module.exports.save({
        user: {
            _id:    user._id,
            email:  user.email
        },
        ip: ip,
        date: now
    });
};
