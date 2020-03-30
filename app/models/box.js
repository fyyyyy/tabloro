/**
 * Module dependencies.
 */

var mongoose = require('mongoose');

var Imager = require('imager');
var config = require('config');
var imagerConfig = require(config.root + '/config/imager.js');
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
 * Box Schema
 */

var BoxSchema = new Schema({
  title: {
    type: String,
    trim: true,
    index: {
      unique: true
    }
  },
  link: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  gameType: {
    type: String
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [],
    get: getTags,
    set: setTags
  },
  image: {
    cdnUri: String,
    files: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  pieces: [{type : Schema.ObjectId, ref : 'Piece', unique: true}],
  counts: {type: Object, default: {}},
  order: {type: Object, default: {}},
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
});

/**
 * Validations
 */

BoxSchema.path('title').required(true, 'Box title cannot be blank');


BoxSchema.path('title').validate(function (title, fn) {
  var Box = mongoose.model('Box');

  if (this.isNew || this.isModified('title')) {
    Box.find({
      title: title
    }).exec(function (err, boxes) {
      fn(!err && boxes.length === 0);
    });
  } else fn(true);
}, 'Box name already exists');

BoxSchema.path('title').validate(function (title, fn) {
  if (this.isNew || this.isModified('title')) {
      fn(utils.validateTitle(title));
  } else fn(true);
}, 'Name can only contain letters, numbers, space and underscore.');


BoxSchema.pre('remove', function (next) {
  var imager = new Imager(imagerConfig, 'S3');
  var files = this.image.files;

  // if there are files associated with the item, remove from the cloud too
  imager.remove(files, function (err) {
    if (err) return next(err);
  }, 'box');

  next();
});



/**
 * Methods
 */

BoxSchema.methods = {
  /**
   * Save box and upload image
   *
   * @param {Object} images
   * @param {Function} cb
   * @api private
   */

  uploadAndSave: function (images, cb) {
    if (!images || !images.length) return this.save(cb);

    var imager = new Imager(imagerConfig, 'S3');
    var self = this;

    this.validate(function (err) {
      if (err) {
        console.error('Validation error', err);
        return cb(err);
      } 
      imager.upload(images, function (err, cdnUri, files) {
        if (err) {
          console.error('upload error', err);
          return cb(err);
        }
        if (files.length) {
          self.image = { cdnUri : cdnUri, files : files };
        }
        self.save(cb);
      }, 'box');
    });
  },

};

/**
 * Statics
 */

BoxSchema.statics = {

  /**
   * Find box by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({
        _id: id
      })
      .populate('user', 'name username')
      .exec(cb);
  },

  /**
   * List boxes
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {};

    this.find(criteria)
      .populate('user', 'name username')
      .sort({
        'createdAt': -1
      }) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  }


};

mongoose.model('Box', BoxSchema);
