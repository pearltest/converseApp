const router = require('express').Router();
const passport = require('passport');
const User = require('../../model/user');

passport.serializeUser((user, done) => {
  try {
    done(null, user.id);
  } catch (err) {
    done(err);
  }
});

passport.deserializeUser((id, done) => {
  User.findById(id)
  .then(user => done(null, user))
  .catch(done);
});



// GET request to get self
router.get('/me', (req, res, next) => {
  res.send(req.user);
});

router.post('/login', (req, res, next) => {
  User.findOrCreate({
    where: {
      username: req.body.username,
    },
    defaults: {
      password: req.body.password,
    },
    attributes: { include: ['password_digest'] },
  })
  .spread((foundUser, created) => {
    if (created) {
      req.logIn(foundUser, (err) => {
        if (err) { return next(err); }
        res.send(foundUser.toJson());
      });
    } else {
      return foundUser.authenticate(req.body.password)
        .then((isAuthorized) => {
          if (!isAuthorized) {
            res.sendStatus(401);
          } else {
            req.logIn(foundUser, (err) => {
              if (err) { return next(err); }
              res.send(foundUser.toJson());
            });
          }
        });
    }
  })
  .catch(next);
});

// DELETE request to logout user
router.delete('/logout', (req, res, next) => {
  req.user.update({ lastLogout: Date.now() })
  .then(() => {
    req.logOut();
    res.sendStatus(204);
  });
});

module.exports = router;
