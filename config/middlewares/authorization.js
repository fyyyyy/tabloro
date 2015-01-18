

/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
  if (req.isAuthenticated()) return next()
  if (req.method == 'GET') req.session.returnTo = req.originalUrl
  res.redirect('/login')
};




/*
 *  Admin authorization routing middleware
 */

exports.admin = {
  hasAuthorization: function (req, res, next) {
    if (!res.locals.isAdmin) {
      return res.redirect('/');
    }
    next();
  }
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
 *  Piece authorization routing middleware
 */

exports.piece = {
  hasAuthorization: function (req, res, next) {
    if ( (req.piece.user && req.piece.user.id === req.user.id) || res.locals.isAdmin) {
      next();
    } else {
      req.flash('info', 'You are not authorized');
      if (req.piece) {
        return res.redirect('/pieces/' + req.piece.id);
      }
      return res.redirect('/pieces/');
    }
  }
};



/*
 *  Box authorization routing middleware
 */

exports.box = {
  hasAuthorization: function (req, res, next) {
    if ( (req.box.user && req.box.user.id === req.user.id) || res.locals.isAdmin) {
      next();
    } else {
      req.flash('info', 'You are not authorized');
      if (req.box) {
        return res.redirect('/boxes/' + req.box.id);
      }
      return res.redirect('/boxes/');
    }
  }
};



/*
 *  Setup authorization routing middleware
 */

exports.setup = {
  hasAuthorization: function (req, res, next) {
    if ( (req.setup.user && req.setup.user.id === req.user.id) || res.locals.isAdmin) {
      next();
    } else {
      req.flash('info', 'You are not authorized');
      if (req.setup) {
        return res.redirect('/boxes/' + req.box.id + '/setups/' + req.setup.id);
      }
      return res.redirect('/setups/');
    }
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

    if (!req.table.user || req.table.user.id !== req.user.id) {
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
      next();
    } else {
      req.flash('info', 'You are not authorized');
      res.redirect('/news/' + req.article.id);
    }
  }
};
