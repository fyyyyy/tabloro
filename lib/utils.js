var R = require('../public/js/ramda.js');

exports.isAdmin = function (user) {
  return (user && user.email === process.env.ADMIN_MAIL);
};


/**
 * Formats mongoose errors into proper array
 *
 * @param {Array} errors
 * @return {Array}
 * @api public
 */


exports.validateTitle = function (string) {
  var match = string.match(/[a-zA-Z0-9_ ]/gi);
  return match && match.join('').length === string.length;
};



exports.errors = function (errors) {
  var keys = Object.keys(errors);
  var errs = [];

  // if there is no validation error, just display a generic error
  if (!keys) {
    return ['Oops! There was an error'];
  }

  keys.forEach(function (key) {
    if (errors[key]) errs.push(errors[key].message);
  });

  return errs;
};

/**
 * Index of object within an array
 *
 * @param {Array} arr
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.indexof = function (arr, obj) {
  var index = -1; // not found initially
  var keys = Object.keys(obj);
  // filter the collection with the given criterias
  var result = arr.filter(function (doc, idx) {
    // keep a counter of matched key/value pairs
    var matched = 0;

    // loop over criteria
    for (var i = keys.length - 1; i >= 0; i--) {
      if (doc[keys[i]] === obj[keys[i]]) {
        matched++;

        // check if all the criterias are matched
        if (matched === keys.length) {
          index = idx;
          return idx;
        }
      }
    }
  });
  return index;
};

/**
 * Find object in an array of objects that matches a condition
 *
 * @param {Array} arr
 * @param {Object} obj
 * @param {Function} cb - optional
 * @return {Object}
 * @api public
 */

exports.findByParam = function (arr, obj, cb) {
  var index = exports.indexof(arr, obj);
  if (~index && typeof cb === 'function') {
    return cb(undefined, arr[index]);
  } else if (~index && !cb) {
    return arr[index];
  } else if (!~index && typeof cb === 'function') {
    return cb('not found');
  }
  // else undefined is returned
};


exports.generateAssets = function (box, unsortedPieces) {
  var stringedPieces = R.map(R.func('toString'))(box.pieces);


  var assets = [];
  R.map(function (obj) {
    var asset = {};
    asset.counts = box.counts[obj.id] || 1;
    var imageUrl = obj.image.cdnUri + '/original_' + obj.image.files[0];

    if (obj.atlasjson) {
      asset.method = 'atlasJSONHash';
      asset.args = [obj.title, imageUrl, obj.atlasjson];
    } else if (obj.jsonAtlas) {
      asset.method = 'atlasJSONHash';
      asset.args = [obj.title, imageUrl, '/pieces/' + obj.id + '/json'];
    } else if (obj.frameWidth) {
      asset.method = 'spritesheet';
      asset.args = [obj.title, imageUrl, obj.frameWidth - obj.spacing, obj.frameHeight, obj.maxFrames, 0, obj.spacing];
      if (obj.isDice) {
        asset.isDice = true;
      }
    } else {
      asset.method = 'image';
      asset.args = [obj.title, imageUrl];
    }

    asset.rotateBy = obj.rotateBy;
    asset.flipable = obj.flipable;
    asset.handable = obj.handable;
    asset.lockable = obj.lockable;
    asset.isStash  = obj.isStash;
    var idx = R.indexOf(obj.id)(stringedPieces);
    assets[idx] = asset;
  })(unsortedPieces);

  return assets;
};
