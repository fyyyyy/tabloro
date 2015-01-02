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
  type: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: false
  },
  atlasjson: {
    type: String,
    trim: false
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
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [],
    get: getTags,
    set: setTags
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
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


PieceSchema.pre('save', function (next) {

  if (this.atlasjson) {
    this.type = 'atlasJSONHash';
  } else if (this.frameWidth) {
    this.type = 'spritesheet';
  } else {
    this.type = 'image';
  }

  next();
});


/**
 * Methods
 */

PieceSchema.methods = {

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
      .sort({
        'createdAt': -1
      }) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  }


};

mongoose.model('Piece', PieceSchema);
