
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Getters
 */

var getTags = function (tags) {
  return tags.join(',');
};

/**
 * Setters
 */

var setTags = function (tags) {
  return tags.split(',');
};

/**
 * Table Schema
 */

var TableSchema = new Schema({
  title: {type : String, default : '', trim : true},
  isPrivate: {type : Boolean, default : false},
  users: [{
    user: {type : Schema.ObjectId, ref : 'User'}
  }],
  tags: {type: [], get: getTags, set: setTags},
  createdAt  : {type : Date, default : Date.now}
});

/**
 * Validations
 */

TableSchema.path('title').required(true, 'Table title cannot be blank');



/**
 * Methods
 */

TableSchema.methods = {


};

/**
 * Statics
 */

TableSchema.statics = {

  /**
   * Find table by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .exec(cb);
  },

  /**
   * List tables
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {};

    this.find(criteria)
      .populate('user', 'name username')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  }
};

mongoose.model('Table', TableSchema);
