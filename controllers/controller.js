/**
 * Parent controller
 *
 * User: Etienne
 * Date: 10/09/13
 * Time: 15:36
 */


////////////////////
// INITIALIZATION //
////////////////////

/////////////
// PRIVATE //
/////////////

////////////
// PUBLIC //
////////////

/**
 * Handles success response
 *
 * @param res : HTTP response
 * @param obj : object to return
 */
module.exports.success = function (res, obj) {
    res.type('json');
    res.json(obj);
};

/**
 * Handles technical error response
 *
 * @param res : HTTP response
 * @param error : error object
 */
module.exports.error = function (res, error) {
    res.type('json');
    res.json(500, { error: error.message });
};

/**
 * Handles access error response
 *
 * @param res : HTTP response
 * @param message : error message
 */
module.exports.unauthorized = function (res, message) {
    res.type('json');
    res.json(401, { error: message });
};

/**
 * Handles resource error response
 *
 * @param res : HTTP response
 * @param message : error message
 */
module.exports.notFound = function (res, message) {
    res.type('json');
    res.json(404, { error: message });
};


