
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var User = require('../models/user.js');
mongoose.model('User');

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
  title: {type : String, trim : true, index: { unique: true } },
  phone: {type : String, trim : true },
  skype: {type : String},
  isPrivate: {type : Boolean, default : false},
  rtcVideo: {type : Boolean, default : true},
  rtcAudio: {type : Boolean, default : true},
  users: [{type : Schema.ObjectId, ref : 'User', unique: true}],
  tags: {type: [], get: getTags, set: setTags},
  createdAt  : {type : Date, default : Date.now},
  tiles: {type: Object, default: {}},
  stacks: {type: Object, default: {}},
  user: {type : Schema.ObjectId, ref : 'User'},
});

/**
 * Validations
 */

TableSchema.path('title').required(true, 'Table title cannot be blank');


TableSchema.path('title').validate(function (title, fn) {
  var Table = mongoose.model('Table');

  if (this.isNew || this.isModified('title')) {
    Table.find({ title: title }).exec(function (err, tables) {
      fn(!err && tables.length === 0);
    });
  } else fn(true);
}, 'Table name already exists');


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

  load: function (title, cb) {
    this.findOne({ title : title })
    .populate('users', 'username')
    .populate('user', 'name username')
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
      // .populate('user', 'name username')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  },


  /**
   * Eureca Update
  */

  eurecaUpdate: function (name, tiles, stacks){
    var table = this.findOne({title: name});
    table.update({tiles: tiles, stacks: stacks}, function (err) {
        if (err) {
          console.log(err);
          console.error('error', 'Could not update table!');
        }

        console.log('updated table', name);
      
    });
  }
};

mongoose.model('Table', TableSchema);
