
/*!
 * Module dependencies.
 */

// Note: We can require users, articles and other cotrollers because we have
// set the NODE_PATH to be ./app/controllers (package.json # scripts # start)

var home = require('home');
var users = require('users');
var articles = require('articles');
var tables = require('tables');
var pieces = require('pieces');
var boxes = require('boxes');
var setups = require('setups');
var comments = require('comments');
var tags = require('tags');
var auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

var adminAuth = [auth.requiresLogin, auth.admin.hasAuthorization];
var articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
var tableAuth = [auth.requiresLogin, auth.table.hasAuthorization];
var pieceAuth = [auth.requiresLogin, auth.piece.hasAuthorization];
var pieceView = [auth.requiresLogin, auth.piece.canShow];
var boxAuth = [auth.requiresLogin, auth.box.hasAuthorization];
var boxView = [auth.requiresLogin, auth.box.canShow];
var setupAuth = [auth.requiresLogin, auth.setup.hasAuthorization];
var setupView = [auth.requiresLogin, auth.setup.canShow];
var commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];
var userAuth = [auth.requiresLogin, auth.user.hasAuthorization];




/**
 * Expose routes
 */

module.exports = function (app, passport) {

  // User
  app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);
  app.get('/users', adminAuth, users.index);
  app.post('/users', users.create);
  app.post('/users/session',
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session);
  app.get('/users/:userId', userAuth, users.show);
  app.get('/users/:userId/edit', userAuth, users.edit);
  app.put('/users/:userId', userAuth, users.update);

  app.get('/auth/facebook',
    passport.authenticate('facebook', {
      scope: [ 'email', 'user_about_me'],
      failureRedirect: '/login'
    }), users.signin);
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/login'
    }), users.authCallback);

  app.get('/auth/twitter',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.signin);
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/login'
    }), users.authCallback);

  app.get('/auth/google',
    passport.authenticate('google', {
      failureRedirect: '/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), users.signin);
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login'
    }), users.authCallback);

  app.param('userId', users.load);

  // Article
  app.param('articleId', articles.load);
  app.get('/news', articles.index);
  app.get('/news/new', articleAuth, articles.new);
  app.post('/news', auth.requiresLogin, articles.create);
  app.get('/news/:articleId', articles.show);
  app.get('/news/:articleId/edit', articleAuth, articles.edit);
  app.put('/news/:articleId', articleAuth, articles.update);
  app.delete('/news/:articleId', articleAuth, articles.destroy);

  // Table
  app.param('tableName', tables.load);
  app.get('/tables', tables.index);
  app.get('/users/:userId/tables', userAuth, tables.index);
  app.get('/tables/new', auth.requiresLogin, tables.new);
  app.post('/tables', auth.requiresLogin, tables.create);
  app.get('/tables/:tableName', tables.show);
  app.get('/tables/:tableName/edit', tableAuth, tables.edit);
  app.put('/tables/:tableName', tableAuth, tables.update);
  app.get('/tables/:tableName/play', tables.play);
  app.delete('/tables/:tableName', tableAuth, tables.destroy);

  // Piece
  app.param('pieceId', pieces.load);
  app.get('/pieces', pieces.index);
  app.get('/users/:userId/pieces', userAuth, pieces.index);
  app.get('/pieces/new', auth.requiresLogin, pieces.new);
  app.post('/pieces', auth.requiresLogin, pieces.create);
  app.get('/pieces/:pieceId', pieceView, pieces.show);
  app.get('/pieces/:pieceId/json', pieces.json);
  app.get('/pieces/:pieceId/edit', pieceAuth, pieces.edit);
  app.put('/pieces/:pieceId', pieceAuth, pieces.update);
  app.delete('/pieces/:pieceId', pieceAuth, pieces.destroy);
  app.get('/pieces/:pieceId/test', auth.requiresLogin, pieces.test);


  // Box
  app.param('boxId', boxes.load);
  app.get('/boxes', boxes.index);
  app.get('/users/:userId/boxes', userAuth, boxes.index);
  app.get('/boxes/new', auth.requiresLogin, boxes.new);
  app.post('/boxes', auth.requiresLogin, boxes.create);
  app.get('/boxes/:boxId', boxView, boxes.show);
  app.get('/boxes/:boxId/test', auth.requiresLogin, boxes.test);
    // auth
    app.get('/boxes/:boxId/count', auth.requiresLogin, boxes.count);
    app.put('/boxes/:boxId/count/update', auth.requiresLogin, boxes.count_update);
    app.get('/boxes/:boxId/edit', boxAuth, boxes.edit);
    app.put('/boxes/:boxId', boxAuth, boxes.update);
    app.get('/boxes/:boxId/add/', boxAuth, boxes.addList);
    app.put('/boxes/:boxId/add/:pieceId', boxAuth, boxes.add);
    app.put('/boxes/:boxId/remove/:pieceId', boxAuth, boxes.remove);
    app.get('/boxes/:boxId/up/:pieceId', boxAuth, boxes.up);
    app.get('/boxes/:boxId/down/:pieceId', boxAuth, boxes.down);
    app.delete('/boxes/:boxId', boxAuth, boxes.destroy);


  // Setup
  app.param('setupName', setups.load);
  app.get('/setups', setups.index);
  app.get('/users/:userId/setups', userAuth, setups.index);
  app.get('/boxes/:boxId/setups/new', auth.requiresLogin, setups.new);
  app.post('/boxes/:boxId/setups', auth.requiresLogin, setups.create);
  app.get('/boxes/:boxId/setups/:setupName', setupView, setups.show);
  app.get('/setups/:setupName', auth.requiresLogin, setups.show);
  app.get('/setups/:setupName/test', auth.requiresLogin, setups.test);
  app.delete('/setups/:setupName', setupAuth, setups.destroy);


  // Home
  app.get('/', home.index);
  app.get('/create', home.create);

  // Comment
  app.param('commentId', comments.load);
  app.post('/news/:articleId/comments', auth.requiresLogin, comments.create);
  app.get('/news/:articleId/comments', auth.requiresLogin, comments.create);
  app.delete('/news/:articleId/comments/:commentId', commentAuth, comments.destroy);

  // Tag
  app.get('/tags/:tag', tags.index);


  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }
    console.error('error', err.stack);
    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res, next) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
};
