
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var utils = require('../../lib/utils');

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
  return tags && tags.split && tags.split(',');
};

/**
 * Setup Schema
 */

var SetupSchema = new Schema({
  title: {type : String, trim : true, index: { unique: true } },
  description: {type : String },
  isPrivate: {type : Boolean, default : false},
  tags: {type: [], get: getTags, set: setTags},
  createdAt  : {type : Date, default : Date.now},
  tiles: {type: Object, default: {}},
  user: {type : Schema.ObjectId, ref : 'User'},
  box: {type : Schema.ObjectId, ref : 'Box'},
  pieces: [{type : Schema.ObjectId, ref : 'Piece', unique: true}],
  counts: {type: Object, default: {}}
});

/**
 * Validations
 */

SetupSchema.path('title').required(true, 'Game setup title cannot be blank');


SetupSchema.path('title').validate(function (title, fn) {
  var Setup = mongoose.model('Setup');

  if (this.isNew || this.isModified('title')) {
    Setup.find({ title: title }).exec(function (err, setups) {
      fn(!err && setups.length === 0);
    });
  } else fn(true);
}, 'Game setup name already exists');


SetupSchema.path('title').validate(function (title, fn) {
  if (this.isNew || this.isModified('title')) {
      fn(utils.validateTitle(title));
  } else fn(true);
}, 'Name can only contain letters, numbers, space and underscore.');


/**
 * Methods
 */

SetupSchema.methods = {


};

/**
 * Statics
 */

SetupSchema.statics = {

  /**
   * Find setup by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (title, cb) {
    this.findOne({ title : title })
    .populate('user', 'name username')
    .populate('box', 'title gameType image order')
    .exec(cb);
  },

  /**
   * List setups
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {};

    this.find(criteria)
      .populate('user', 'name username')
      .populate('box', 'id title image')
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  },


  /**
   * Eureca Update
  */

  eurecaUpdate: function (name, tiles){
    this.findOneAndUpdate({title: name}, {tiles: tiles}, function (err, setup) {
      if (err || !setup) {
        console.error('error', err, 'Could not update game setup!', setup);
        return;
      }

      console.log('updated game setup', setup);
    });
  }


};

mongoose.model('Setup', SetupSchema);
