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
 * Piece Schema
 */

var PieceSchema = new Schema({
  title: {
    type: String,
    trim: true,
    index: {
      unique: true
    }
  },
  description: {
    type: String
  },
  type: {
    type: String,
    trim: true
  },
  atlasjson: {
    type: String,
    trim: false
  },
  jsonAtlas: {
    type: Object
  },
  frameWidth: {
    type: Number
  },
  frameHeight: {
    type: Number
  },
  maxFrames: {
    type: Number
  },
  spacing: {
    type: Number,
    default: 0
  },
  rotateBy: {
    type: Number,
    default: 0
  },
  flipable: {
    type: Boolean,
    default: false
  },
  isStash: {
    type: Boolean,
    default: false
  },
  lockable: {
    type: Boolean,
    default: false
  },
  handable: {
    type: Boolean,
    default: false
  }, 
  isDice: {
    type: Boolean,
    default: false
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
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Validations
 */

PieceSchema.path('title').required(true, 'Piece title cannot be blank');


PieceSchema.path('title').validate(function (title, fn) {
  var Piece = mongoose.model('Piece');

  if (this.isNew || this.isModified('title')) {
    Piece.find({
      title: title
    }).exec(function (err, pieces) {
      fn(!err && pieces.length === 0);
    });
  } else fn(true);
}, 'Piece name already exists');



PieceSchema.path('title').validate(function (title, fn) {
  if (this.isNew || this.isModified('title')) {
      fn(utils.validateTitle(title));
  } else fn(true);
}, 'Name can only contain letters, numbers, space and underscore.');


PieceSchema.pre('save', function (next) {

  if (this.atlasjson || this.jsonAtlas) {
    this.type = 'atlasJSONHash';
  } else if (this.frameWidth) {
    this.type = 'spritesheet';
  } else {
    this.type = 'image';
  }

  next();
});



PieceSchema.pre('remove', function (next) {
  var imager = new Imager(imagerConfig, 'S3');
  var files = this.image.files;

  // if there are files associated with the item, remove from the cloud too
  imager.remove(files, function (err) {
    if (err) return next(err);
  }, 'piece');

  next();
});



/**
 * Methods
 */

PieceSchema.methods = {

  /**
   * Save piece and upload image
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
      }, 'piece');
    });
  },

};

/**
 * Statics
 */

PieceSchema.statics = {

  /**
   * Find piece by id
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
   * List pieces
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

mongoose.model('Piece', PieceSchema);
