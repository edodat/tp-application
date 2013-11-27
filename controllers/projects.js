/**
 * Projects controller
 *
 * User: Etienne Dodat
 * Date: 27/11/13
 */

////////////////////
// INITIALIZATION //
////////////////////

var controller = require('./controller.js'),
    Project = require('../models/project.js');

/////////////
// PRIVATE //
/////////////

////////////
// PUBLIC //
////////////

/**
 * Retrieves projects
 */
module.exports.getProjects = function(req, res){
    Project.find({}).sort({ name: 1 }, controller.wrapup(res));
}

/**
 * Creates a project
 */
module.exports.createProject = function(req, res){
    var name = req.body.name;

    Project.save({ name: name }, controller.wrapup(res));
};

/**
 * Updates a project
 */
module.exports.updateProject = function(req, res){
    var _id = req.params._id;
    var name = req.body.name;

    Project.update({ _id: _id }, { $set: { name: name } }, controller.wrapup(res));
};

/**
 * Deletes a project
 */
module.exports.deleteProject = function(req, res){
    var _id = req.params._id;

    Project.remove({ _id: _id });
    return controller.success(res);
};


