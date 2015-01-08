/*global next*/
/**
 * Module dependencies.
 */

"use strict";

var mongoose = require('mongoose');
var Piece = mongoose.model('Piece');
var utils = require('../../lib/utils');
var R = require('../../public/js/ramda.js');
var extend = require('util')._extend;




/**
 * Load
 */

exports.load = function (req, res, next, id) {
    Piece.load(id, function (err, piece) {
        if (err) return next(err);
        if (!piece) return next(new Error('piece not found'));
        req.piece = piece;
        next();
    });
};

/**
 * List
 */

exports.index = function (req, res) {
    var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
    var perPage = 30;
    var options = {
        perPage: perPage,
        page: page
    };
    options.criteria = res.locals.isAdmin ? {} : {
        isPrivate: false
    };

    Piece.list(options, function (err, pieces) {
        if (err) return res.render('500');

        Piece.count().exec(function (err, count) {
            res.render('pieces/index', {
                title: 'Gaming Pieces',
                pieces: pieces,
                page: page + 1,
                pages: Math.ceil(count / perPage),
            });
        });
    });
};


/**
 * New piece
 */

exports.new = function (req, res) {
    res.render('pieces/new', {
        title: 'New Gaming Piece(s)',
        piece: new Piece({})
    });
};



/**
 * Create a piece
 */

exports.create = function (req, res) {
    console.log('create piece', req.body);
    var piece = new Piece(req.body);
    var images = req.files.image ? [req.files.image] : undefined;

    piece.user = req.user;

    piece.uploadAndSave(images, function (err) {
        if (!err) {
            req.flash('success', 'Successfully created piece!');
            return res.redirect('/pieces/' + piece.id);
        }
        console.log(err);
        res.render('pieces/new', {
            title: 'New Piece',
            piece: piece,
            errors: utils.errors(err.errors || err)
        });
    });
};


/**
 * Edit a piece
 */

exports.edit = function (req, res) {
  res.render('pieces/edit', {
    title: 'Edit ' + req.piece.title,
    piece: req.piece
  });
};



/**
 * Update piece
 */

exports.update = function (req, res){
  var piece = req.piece;
  var images = req.files.image ? [req.files.image] : undefined;

  // make sure no one changes the user
  delete req.body.user;
  piece = extend(piece, req.body);



  piece.uploadAndSave(images, function (err) {
    if (!err) {
      return res.redirect('/pieces/' + piece._id);
    }

    res.render('pieces/edit', {
      title: 'Edit Piece(s)',
      piece: piece,
      errors: utils.errors(err.errors || err)
    });
  });  
  
};



/**
 * Show
 */

exports.show = function (req, res) {
    var piece = req.piece;

    Piece.load(piece.id, function (err, piece) {
        if (err) return next(err);
        if (!piece) return next(new Error('piece not found'));
        req.piece = piece;
        res.render('pieces/show', {
            title: 'Piece: ' + piece.title,
            piece: piece
        });
    });
};




/**
 * Delete a piece
 */

exports.destroy = function (req, res) {
    var piece = req.piece;
    piece.remove(function (err) {
        if (err) {
            req.flash('alert', 'Could not delete piece');
            return;
        }
        req.flash('info', 'Deleted successfully');
        res.redirect('/pieces');
    });
};
