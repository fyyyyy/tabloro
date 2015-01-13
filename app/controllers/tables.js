/*global next*/
/**
 * Module dependencies.
 */

"use strict";

var mongoose = require('mongoose');
var Table = mongoose.model('Table');
var Setup = mongoose.model('Setup');
var Piece = mongoose.model('Piece');
var utils = require('../../lib/utils');
var R = require('../../public/js/ramda.js');


/**
 * Load
 */

exports.load = function (req, res, next, title) {
    Table.load(title, function (err, table) {
        if (err) return next(err);
        if (!table) return next(new Error('not found'));
        req.table = table;
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


    // res.render('game/index', {layout: false, title: 'game room'});

    Table.list(options, function (err, tables) {
        if (err) return res.render('500');

        R.forEach(function (table) {
            table.players = req.eurecaServer.getPlayerIds(table.title);
        })(tables);

        Table.count().exec(function (err, count) {
            res.render('tables/index', {
                title: 'Public Tables',
                tables: tables,
                page: page + 1,
                pages: Math.ceil(count / perPage),
            });
        });
    });
};


/**
 * New table
 */

exports.new = function (req, res) {
    var table = new Table({});
    table.setupName = req.query.setupName;
    res.render('tables/new', {
        title: 'New Table',
        table: table
    });
};



/**
 * Create a table
 */

exports.create = function (req, res) {
    console.log('create table', req.body);
    var table = new Table(req.body);
    var setupName = req.body.setupName;

    table.user = req.user;
    table.stacks = {};

    Setup.findOne({title: setupName}).exec(function (err, setup) {
        table.setup = setup;
        table.tiles = setup.tiles || {};

        console.log('setup', setup, setupName);
        table.save(function (err) {
            if (!err) {
                req.flash('success', 'Successfully created table!');
                return res.redirect('/tables/' + table.title);
            }
            console.log(err);
            res.render('tables/new', {
                title: 'New Table',
                table: table,
                errors: utils.errors(err.errors || err)
            });
        });
    });


};



/**
 * Show
 */

exports.show = function (req, res) {
    var table = req.table;
    table.update({
        $addToSet: {
            users: req.user
        }
    }, function (err) {
        if (err) {
            console.log(err);
            req.flash('error', 'Could not join table!');
            return res.redirect('/tables');
        }

        Table.load(table.title, function (err, table) {
            if (err) return next(err);
            if (!table) return next(new Error('not found'));
            req.table = table;
            res.render('tables/show', {
                title: 'Table: ' + table.title,
                table: table,
                players: req.eurecaServer.getPlayers(table.title)
            });
        });

    });
};

exports.play = function (req, res) {
    var table = req.table;
    var setup = table.setup;

    Piece.list({ criteria: {'_id': {$in: setup.pieces }}}, function (err, unsortedPieces) {
        if (err) {
            req.flash('alert', 'Cannot test game stup!');
            return res.redirect('/boxes/' + box._id + '/setups/' + setup.id);
        }

        var assets = utils.generateAssets(setup, unsortedPieces);
        console.log('assets', assets);
        
        res.render('game/play', {
            title: 'Play - ' + table.title,
            game: table.setup,
            room: table,
            user: req.user,
            assets: assets,
            mode: 'play'
        });

    });

};


/**
 * Delete a table
 */

exports.destroy = function (req, res) {
    var table = req.table;
    table.remove(function (err) {
        if (err) {
            req.flash('alert', 'Could not delete table');
            return;
        }
        req.flash('info', 'Deleted successfully');
        res.redirect('/tables');
    });
};
