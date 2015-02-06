
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Piece = mongoose.model('Piece');
var Box = mongoose.model('Box');
var Setup = mongoose.model('Setup');
var Table = mongoose.model('Table');
var utils = require('../../lib/utils');
var extend = require('util')._extend;
var R = require('ramda.js');


/**
 * Load
 */

exports.load = function (req, res, next, id) {
  var options = {
    criteria: { _id : id }
  };
  User.load(options, function (err, user) {
    if (err) return next(err);
    if (!user) return next(new Error('Failed to load User ' + id));
    req.profile = user;
    next();
  });
};


/**
 * List
 */

exports.index = function (req, res){
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var perPage = 28;
  var options = {
    perPage: perPage,
    page: page
  };

  var countElements = 0;

  User.list(options, function (err, users) {
    if (err) return res.render('500');

    Piece.find().exec(function (err, pieces) {
      var countPieces = pieces.length;
      
      R.forEach(function (piece) {
        countElements += parseInt(piece.maxFrames) || 0;
      })(pieces);

      Box.count().exec(function (err, countBoxes) {
        Setup.count().exec(function (err, countSetups) {
          Table.count().exec(function (err, countTables) {

            User.count().exec(function (err, count) {
              res.render('users/index', {
                title: 'Users',
                users: users,
                page: page + 1,
                pages: Math.ceil(count / perPage),
                count: count,
                countPieces: countPieces,
                countBoxes: countBoxes,
                countSetups: countSetups,
                countTables: countTables,
                countElements: countElements
              });
            });

          });
        });
      });
    });
  });
};

/**
 * Create user
 */

exports.create = function (req, res) {
  var user = new User(req.body);
  user.provider = 'local';
  user.save(function (err) {
    if (err) {
      return res.render('users/signup', {
        error: utils.errors(err.errors),
        user: user,
        title: 'Sign up'
      });
    }

    // manually login the user once successfully signed up
    req.logIn(user, function(err) {
      if (err) req.flash('info', 'Sorry! We are not able to log you in!');
      return res.redirect('/');
    });
  });
};

/**
 *  Show profile
 */

exports.show = function (req, res) {
  var user = req.profile;
  res.render('users/show', {
    title: 'User: ' + user.username,
    user: user,
    isOwner: user.id === req.user.id
  });
};


/**
 * Edit user
 */

exports.edit = function (req, res) {
  res.render('users/edit', {
    title: 'Edit ' + req.user.username,
    user: req.user
  });
};


/**
 * Update user
 */

exports.update = function (req, res){
  var user = req.user;

  // make sure no one changes the user
  delete req.body.user;
  user = extend(user, req.body);

  user.save(function (err) {
    if (!err) {
      return res.redirect('/users/' + user._id);
    }

    res.render('users/edit', {
      title: 'Edit ' + user.username,
      user: user,
      errors: utils.errors(err.errors || err)
    });
  });
};


exports.signin = function (req, res) {};

/**
 * Auth callback
 */

exports.authCallback = login;

/**
 * Show login form
 */

exports.login = function (req, res) {
  res.render('users/login', {
    title: 'Login'
  });
};

/**
 * Show sign up form
 */

exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Sign up',
    user: new User()
  });
};

/**
 * Logout
 */

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

/**
 * Session
 */

exports.session = login;

/**
 * Login
 */

function login (req, res) {
  var redirectTo = req.session.returnTo ? req.session.returnTo : '/';
  delete req.session.returnTo;
  res.redirect(redirectTo);
};
