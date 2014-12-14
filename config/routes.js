
/*!
 * Module dependencies.
 */

// Note: We can require users, articles and other cotrollers because we have
// set the NODE_PATH to be ./app/controllers (package.json # scripts # start)

var home = require('home');
var users = require('users');
var articles = require('articles');
var tables = require('tables');
var comments = require('comments');
var tags = require('tags');
var auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

var articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
var tableAuth = [auth.requiresLogin, auth.table.hasAuthorization];
var commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];
var userAuth = [auth.requiresLogin, auth.user.hasAuthorization];




/**
 * Expose routes
 */

module.exports = function (app, passport) {

  // user routes
  app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);
  app.post('/users', users.create);
  app.post('/users/session',
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session);
  app.get('/users/:userId', users.show);
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

  // article routes
  app.param('articleId', articles.load);
  app.get('/news', articles.index);
  app.get('/news/new', articleAuth, articles.new);
  app.post('/news', auth.requiresLogin, articles.create);
  app.get('/news/:articleId', articles.show);
  app.get('/news/:articleId/edit', articleAuth, articles.edit);
  app.put('/news/:articleId', articleAuth, articles.update);
  app.delete('/news/:articleId', articleAuth, articles.destroy);

  // table routes
  app.param('tableName', tables.load);
  app.get('/tables', tables.index);
  app.get('/tables/new', tableAuth, tables.new);
  app.post('/tables', auth.requiresLogin, tables.create);
  app.get('/tables/:tableName', tables.show);
  app.get('/tables/:tableName/play', tables.play);

  // home route
  app.get('/', home.index);

  // comment routes
  app.param('commentId', comments.load);
  app.post('/news/:articleId/comments', auth.requiresLogin, comments.create);
  app.get('/news/:articleId/comments', auth.requiresLogin, comments.create);
  app.delete('/news/:articleId/comments/:commentId', commentAuth, comments.destroy);

  // tag routes
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
