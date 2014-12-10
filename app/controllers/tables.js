/**
 * Module dependencies.
 */
"use strict";

var mongoose = require('mongoose');
var Table = mongoose.model('Table');
var utils = require('../../lib/utils');


/**
 * Load
 */

exports.load = function (req, res, next, id){
  Table.load(id, function (err, table) {
    if (err) return next(err);
    if (!table) return next(new Error('not found'));
    req.table = table;
    next();
  });
};

/**
 * List
 */

exports.index = function (req, res){
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var perPage = 30;
  var options = {
    perPage: perPage,
    page: page
  };
  options.criteria = res.locals.isAdmin ? {} : { isPrivate: false};
  
  // res.render('game/index', {layout: false, title: 'game room'});

  Table.list(options, function (err, tables) {
    if (err) return res.render('500');
    Table.count().exec(function (err, count) {
      res.render('tables/index', {
        title: 'Public Tables',
        tables: tables,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });


};


/**
 * New table
 */

exports.new = function (req, res){
  res.render('tables/new', {
    title: 'New Table',
    table: new Table({})
  });
};



/**
 * Create a table
 */

exports.create = function (req, res) {
  console.log('create table', req.body);
  var table = new Table(req.body);
  
  table.save(function (err) {
    if (!err) {
      req.flash('success', 'Successfully created table!');
      return res.redirect('/tables/'+table._id);
    }
    console.log(err);
    res.render('tables/new', {
      title: 'New Table',
      table: table,
      errors: utils.errors(err.errors || err)
    });
  });
};


/**
 * Show
 */

exports.show = function (req, res){
  var table = req.table;

  console.log('tables show');
  res.render('tables/show', {
    title: 'Table Lobby',
    table: table
  });
};
