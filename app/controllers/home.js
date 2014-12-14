
/**
 * Module dependencies.
 */
"use strict";

var mongoose = require('mongoose');
var Article = mongoose.model('Article');
var Table = mongoose.model('Table');
var utils = require('../../lib/utils');
var extend = require('util')._extend;
var R = require('../../public/js/ramda.js');


exports.index = function (req, res){
  var tableOptions = {
    perPage: 8,
    criteria: {
      isPrivate: false
    }
  };

  Table.list(tableOptions, function (err, tables) {
    if (err) return res.render('500');
    
    R.forEach(function (table) {
      table.players = req.eurecaServer.getPlayerIds(table.title);
    })(tables);

    Table.count().exec(function (err, count) {
      Article.list({}, function (err, articles) {
        if (err) return res.render('500');
        Article.count().exec(function (err, count) {
          res.render('home/index', {
            title: 'Tablemania',
            articles: articles,
            tables: tables
          });
        });
      });
    });
  });

};
