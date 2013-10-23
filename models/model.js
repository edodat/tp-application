/**
 * Parent model (abstract class)
 *
 * User: Etienne
 * Date: 12/09/13
 */

////////////////////
// INITIALIZATION //
////////////////////

var mongo = require('mongojs'),
    config = require('../config/mongo.js');

/////////////
// PRIVATE //
/////////////

// Connect to database
var db = mongo.connect(config.connectionString);

////////////
// PUBLIC //
////////////

/**
 * Initialization function for Model's submodules.
 * Augments submodule capabilities by adding static functions.
 *
 * Usage (submodule definition) :
 *      var MyModel = {};
 *      Model.declare(MyModel, 'mycollection');
 *      ... define custom methods...
 *
 * @param Submodule "exports"
 * @param collectionName : Mongo collection where submodule objects are stored
 */
module.exports.declare = function (submodule, collectionName){
    // create _collection variable in subclass
    var collection = module.exports._db.collection(collectionName);
    submodule._collection  = collection;
    // augment submodule with MongoJS functions
    submodule.findById = module.exports.findById;
    submodule.find = module.exports.find;
    submodule.findOne = module.exports.findOne;
    submodule.findAndModify = module.exports.findAndModify;
    submodule.update = module.exports.update;
    submodule.save = module.exports.save;
    submodule.remove = module.exports.remove;
};

/**
 * DB connection handler.
 */
module.exports._db = db;

/**
 * Static functions mapped to MongoJS collection functions.
 * These functions are made available to Model's subclasses by "Model.declare" function above.
 */

module.exports.find = function (){
    return this._collection.find.apply(this._collection, arguments);
};

module.exports.findOne = function () {
    return this._collection.findOne.apply(this._collection, arguments);
};

module.exports.findById = function (id, callback) {
    return this._collection.findOne({ _id: module.exports.ObjectId(id) }, callback);
};

module.exports.findAndModify = function () {
    return this._collection.findAndModify.apply(this._collection, arguments);
};

module.exports.update = function () {
    return this._collection.update.apply(this._collection, arguments);
};

module.exports.save = function () {
    return this._collection.save.apply(this._collection, arguments);
};

module.exports.remove = function () {
    return this._collection.remove.apply(this._collection, arguments);
};

/**
 * Utility function to convert String id to ObjectId.
 *
 * @param id (string or ObjectId)
 * @returns ObjectId
 */
module.exports.ObjectId = function (id){
    if (typeof id == 'string') return module.exports._db.ObjectId(id);
    else return id;
};
