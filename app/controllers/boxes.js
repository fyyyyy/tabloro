/*global next*/
/**
 * Module dependencies.
 */

"use strict";

var mongoose = require('mongoose');
var Box = mongoose.model('Box');
var Piece = mongoose.model('Piece');
var utils = require('../../lib/utils');
var R = require('../../public/js/ramda.js');
var extend = require('util')._extend;




/**
 * Load
 */

exports.load = function (req, res, next, id) {
    Box.load(id, function (err, box) {
        if (err) return next(err);
        if (!box) return next(new Error('box not found'));
        req.box = box;
        next();
    });
};

/**
 * List
 */

exports.index = function (req, res) {
    var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
    var perPage = 20;
    var options = {
        perPage: perPage,
        page: page
    };
    options.criteria = res.locals.isAdmin ? {} : {
        isPrivate: false
    };

    Box.list(options, function (err, boxes) {
        if (err) return res.render('500');

        Box.count().exec(function (err, count) {
            res.render('boxes/index', {
                title: req.query.pick ? 'Pick a box' : 'Game Boxes',
                pick: req.query.pick,
                boxes: boxes,
                page: page + 1,
                pages: Math.ceil(count / perPage),
            });
        });
    });
};


/**
 * New box
 */

exports.new = function (req, res) {
    res.render('boxes/new', {
        title: 'New Game Box',
        box: new Box({})
    });
};



/**
 * Create a box
 */

exports.create = function (req, res) {
    console.log('create box', req.body);
    var box = new Box(req.body);
    var images = req.files.image ? [req.files.image] : undefined;

    box.user = req.user;

    box.uploadAndSave(images, function (err) {
        if (!err) {
            req.flash('success', 'Successfully created box!');
            return res.redirect('/boxes/' + box.id);
        }
        console.log(err);
        res.render('boxes/new', {
            title: 'New Game Box',
            box: box,
            errors: utils.errors(err.errors || err)
        });
    });
};


/**
 * Edit a box
 */

exports.edit = function (req, res) {
  res.render('boxes/edit', {
    title: 'Edit ' + req.box.title,
    box: req.box
  });
};



/**
 * Update box
 */

exports.update = function (req, res){
  var box = req.box;
  var images = req.files.image ? [req.files.image] : undefined;

  // make sure no one changes the user
  delete req.body.user;
  box = extend(box, req.body);

  console.log('images', images);


  box.uploadAndSave(images, function (err) {
    if (!err) {
        req.flash('info', 'Updated box');
        return res.redirect('/boxes/' + box._id);
    }

    req.flash('alert', 'Could not update box');
    res.render('boxes/edit', {
      title: 'Edit Box',
      box: box,
      errors: utils.errors(err.errors || err)
    });
  });  

};



/**
 * Add piece
 */

exports.add = function (req, res){
  var box = req.box;

  // make sure no one changes the user
  delete req.body.user;
  box = extend(box, req.body);

  box.update({
        $addToSet: {
            pieces: req.piece
        }
    }, function (err) {
    if (!err) {
        req.flash('info', 'Added pieces to box');
        return res.redirect('/boxes/' + box._id);
    }

    req.flash('alert', 'Could not add pieces to box');
    res.render('boxes/show', {
      title: 'View Box',
      box: box,
      errors: utils.errors(err.errors || err)
    });
  });  
};


/**
 * Remove piece
 */

exports.remove = function (req, res){
  var box = req.box;

  // make sure no one changes the user
  delete req.body.user;
  box = extend(box, req.body);

  box.update({
        $pull: {
            pieces: req.piece
        }
    }, function (err) {
    if (!err) {
        req.flash('info', 'Removed piece from box');
        return res.redirect('/boxes/' + box._id);
    }

    req.flash('alert', 'Could not remove piece from box');
    res.render('boxes/show', {
      title: 'View Box',
      box: box,
      errors: utils.errors(err.errors || err)
    });
  });  
};



/**
 * Show
 */

exports.show = function (req, res) {
    var box = req.box;
    var globalPieces;
    var globalPiecesCount;

    var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
    var perPage = 30;
    var options = {
        perPage: perPage,
        page: page
    };
    options.criteria = res.locals.isAdmin ? {} : {
        isPrivate: false
    };

    Piece.list({ criteria: {'_id': {$in: box.pieces }}}, function (err, unsortedPieces) {
        var boxPieces = [];
        var stringedPieces = R.map(R.func('toString'))(box.pieces);

        R.forEach(function (piece) {
            var idx = R.indexOf(piece.id)(stringedPieces);
            boxPieces[idx] = piece;
        })(unsortedPieces);

        Piece.list(options, function (err, pieces) {
            if (err) return res.render('500');

            Piece.count().exec(function (err, count) {
                globalPieces = pieces;
                globalPiecesCount = count;
            
                Box.load(box.id, function (err, box) {
                    if (err) return next(err);
                    if (!box) return next(new Error('box not found'));
                    req.box = box;
                    res.render('boxes/show', {
                        title: 'Box: ' + box.title,
                        box: box,
                        pieces: globalPieces,
                        boxPieces: boxPieces,
                        count: globalPiecesCount,
                        isOwner: box.user.id === req.user.id
                    });
                });
            });
        });

    });
};

/**
 * Count
 */

exports.count = function (req, res) {
    var box = req.box;

    var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
    var perPage = 30;
    var options = {
        perPage: perPage,
        page: page
    };
    options.criteria = res.locals.isAdmin ? {} : {
        isPrivate: false
    };

    Piece.list({ criteria: {'_id': {$in: box.pieces }}}, function (err, unsortedPieces) {
        var boxPieces = [];
        var stringedPieces = R.map(R.func('toString'))(box.pieces);

        R.forEach(function (piece) {
            var idx = R.indexOf(piece.id)(stringedPieces);
            boxPieces[idx] = piece;
        })(unsortedPieces);

        Box.load(box.id, function (err, box) {
            if (err) return next(err);
            if (!box) return next(new Error('box not found'));
            req.box = box;
            res.render('boxes/count', {
                title: 'Edit contents of ' + box.title,
                box: box,
                boxPieces: boxPieces
            });
        });

    });
};

exports.count_update = function function_name (req, res) {
        var box = req.box;
        var counts = req.body;
        console.log('counts', counts);
        box.counts = counts;

        box.save(function (err) {
            if (!err) {
                req.flash('info', 'Updated piece counts for box.');
                return res.redirect('/boxes/' + box._id);
            }

            req.flash('alert', 'Could not update box counts');
            res.render('boxes/count', {
                title: 'Edit contents of ' + box.title,
                box: box,
                errors: utils.errors(err.errors || err)
            });
          });  


};


/**
 * Test a box
 */

exports.test = function (req, res) {
    var box = req.box;

    Piece.list({ criteria: {'_id': {$in: box.pieces }}}, function (err, unsortedPieces) {
        if (err) {
            req.flash('alert', 'Cannot test box!');
            return res.redirect('/boxes/' + box._id);
        }

        var assets = utils.generateAssets(box, unsortedPieces);
        
        
        res.render('game/test', {
            title: 'Test Box: ' + box.title,
            game: box,
            room: box,
            user: req.user,
            assets: assets,
            mode: 'test',
            backUrl: '/boxes/' + box._id
        });

    });
};



/**
 * Delete a box
 */

exports.destroy = function (req, res) {
    var box = req.box;
    box.remove(function (err) {
        if (err) {
            req.flash('alert', 'Could not delete box');
            return;
        }
        req.flash('info', 'Box deleted successfully');
        res.redirect('/boxes');
    });
};
