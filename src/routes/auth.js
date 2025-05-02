import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import crypto from "crypto";
import db from "../db/database.js";
const router = express.Router();

passport.use(
  new LocalStrategy(function verify(username, password, cb) {
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      function (err, row) {
        if (err) {
          return cb(err);
        }
        if (!row) {
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }

        crypto.pbkdf2(
          password,
          row.salt,
          310000,
          32,
          "sha256",
          function (err, hashedPassword) {
            if (err) {
              return cb(err);
            }
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
              return cb(null, false, {
                message: "Incorrect username or password.",
              });
            }
            return cb(null, row);
          },
        );
      },
    );
  }),
);

router.post("/register", function (req, res) {
  var salt = crypto.randomBytes(16);
  crypto.pbkdf2(
    req.body.password,
    salt,
    310000,
    32,
    "sha256",
    function (err, hashedPassword) {
      if (err) {
        return console.error(err);
      }
      db.run(
        "INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)",
        [req.body.username, hashedPassword, salt],
        function (err) {
          if (err) {
            return res.sendStatus(409);
          }
          return res.sendStatus(200);
        },
      );
    },
  );
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Internal server error when authenticating" });
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "Login failed" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Internal server error when logging in" });
      }
      return res.status(200).json({ message: "Login successful" });
    });
  })(req, res, next);
});

router.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json(req.user);
  }
  return res.status(401).json({ message: "Unauthorized" });
});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

export default router;
