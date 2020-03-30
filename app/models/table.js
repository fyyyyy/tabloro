
/**
 * Module dependencies.
 */
var utils = require('../../lib/utils');

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
// var User = require('../models/user.js');
// mongoose.model('User');

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
  return tags && tags.split && tags.split(',');
};

/**
 * Table Schema
 */

var TableSchema = new Schema({
  title: {type : String, trim : true, index: { unique: true } },
  phone: {type : String, trim : true },
  skype: {type : String},
  rules: {type : String},
  isPrivate: {type : Boolean, default : false},
  rtcVideo: {type : Boolean, default : true},
  rtcAudio: {type : Boolean, default : true},
  users: [{type : Schema.ObjectId, ref : 'User', unique: true}],
  tags: {type: [], get: getTags, set: setTags},
  createdAt  : {type : Date, default : Date.now},
  tiles: {type: Object, default: {}},
  stacks: {type: Object, default: {}},
  user: {type : Schema.ObjectId, ref : 'User'},
  setup: {type : Schema.ObjectId, ref : 'Setup'},
  box: {type : Schema.ObjectId, ref : 'Box'},
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


TableSchema.path('title').validate(function (title, fn) {
  if (this.isNew || this.isModified('title')) {
      fn(utils.validateTitle(title));
  } else fn(true);
}, 'Name can only contain letters, numbers, space and underscore.');


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
    .populate('setup', 'title pieces counts box')
    .populate('box', 'title image description link order')
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
      .populate('box', 'title image')
      .populate('user')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  },


  /**
   * Eureca Update
  */

  eurecaUpdate: function (name, tiles, stacks){
    this.findOneAndUpdate({title: name}, {tiles: tiles, stacks: stacks}, function (err, table) {
      if (err || !table) {
        console.error('error', err, 'Could not update table!', table);
        return;
      }

      console.log('updated table', table.id);
    });
  }


};

mongoose.model('Table', TableSchema);
