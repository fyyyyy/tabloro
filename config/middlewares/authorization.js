

/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (req.isAuthenticated()) return next()
  if (req.method == 'GET') req.session.returnTo = req.originalUrl
  res.redirect('/login')
};

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization: function (req, res, next) {
    if (req.profile.id != req.user.id) {
      req.flash('info', 'You are not authorized');
      return res.redirect('/users/' + req.profile.id);
    }
    next();
  }
};

/*
 *  Article authorization routing middleware
 */

exports.article = {
  hasAuthorization: function (req, res, next) {
    if (!res.locals.isAdmin) {
      req.flash('info', 'You are not authorized');
      if (req.article) {
        return res.redirect('/news/' + req.article.id);
      }
      return res.redirect('/news/');
    }
    next();
  }
};

/*
 *  Table authorization routing middleware
 */

exports.table = {
  hasAuthorization: function (req, res, next) {
    var players = req.eurecaServer.getPlayers(req.table.title);

    if (players && players.length) {
      req.flash('error', 'Unfortunately not possible. Players are currently playing at this table');
      if (req.table) {
        return res.redirect('/tables/' + req.table.title);
      }
      return res.redirect('/tables/');
    }

    if (!req.table.user || req.table.user.id != req.user.id) {
      req.flash('error', 'You are not authorized');
      if (req.table) {
        return res.redirect('/tables/' + req.table.title);
      }
      return res.redirect('/tables/');
    }
    next();
  }
};

/**
 * Comment authorization routing middleware
 */

exports.comment = {
  hasAuthorization: function (req, res, next) {
    // if the current user is comment owner or article owner
    // give them authority to delete
    if (req.user.id === req.comment.user.id || req.user.id === req.article.user.id) {
      next()
    } else {
      req.flash('info', 'You are not authorized')
      res.redirect('/news/' + req.article.id)
    }
  }
}
