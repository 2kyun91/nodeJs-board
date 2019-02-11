var express = require("express");
var router = express.Router();
var passport = require("../config/passport");

// Home
router.get("/", function(req, res) {
  res.render("home/welcome");
});

router.get("/about", function(req, res) {
  res.render("home/about");
});

// Login
router.get("/login", function(req, res) { // login view를 보여주는 route이다.
  var username = req.flash("username")[0];
  var errors = req.flash("errors")[0] || {};
  res.render("home/login", {
    username : username,
    errors : errors
  });
});

// Post Login
router.post("/login", function(req, res, next) { // 보내진 form의 validation을 위한 콜백함수, 에러가 있으면 flash를 만들고 login view로 redirect한다.
  var errors = {};
  var isValid = true;
  if(!req.body.username) {
    isValid = false;
    errors.username = "사용자명은 필수항목입니다!";
  }

  if(!req.body.password) {
    isValid = false;
    errors.password = "비밀번호는 필수항목입니다!";
  }

  if(isValid) {
    next();
  } else {
    req.flash("errors", errors);
    res.redirect("/login");
  }
}, passport.authenticate("local-login", { // passport local strategy를 호출해서 authenticate(로그인)을 진행하는 콜백함수.
  successRedirect : "/",
  failureRedirect : "/login"
}));

// Logout
router.get("/logout", function(req, res) { // logout을 해주는 route이다, passport에서 제공된 req.logout 함수를 사용하여 "/"로 redirect한다.
  req.logout();
  res.redirect("/");
});

module.exports = router;
