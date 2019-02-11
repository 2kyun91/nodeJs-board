var passport = require("passport");
// strategy들은 대부분 require 다음에 .strategy가 붙는다.
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/user");

// serialize & deserialize User
// DB에서 발견한 user를 어떻게 session에 저장할지 정하는 부분이다.
// user 정보 전체를 저장하면 사이트 성능이 떨어질수 있기 때문에 user의 id만 session에 저장한다.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// request시에 session에서 어떻게 user object를 만들지를 정하는 부분이다.
// request 때 마다 user 정보를 db에서 새로 읽어온다.
passport.deserializeUser(function(id, done) {
  User.findOne({_id : id}, function(err, user) {
    done(err, user);
  });
});

// local Strategy
passport.use("local-login", new LocalStrategy({
  usernameField : "username", // ejs의 로그인 form의 username과 password 항목의 name 값.
  passwordField : "password", // ejs의 로그인 form의 username과 password 항목의 name 값.
  passReqToCallback : true
}, function(req, username, password, done) {
  /*
  로그인 시 이 함수가 호출된다.
  DB에서 해당 user를 찾고 user model에 설정했던 user.authenticate() 함수를 사용해서 입력받은 password와 저장된 password hash 값을 비교해서
  값이 일치하면 user 정보를 done에 담아 return하고("return done(null, user);")
  일치하지 않으면 flash를 생성한 후 done에 false를 담아 return 한다("return done(null, false);").
  user가 전달되지 않으면 local-strategy는 실패로 간주한다.
  done() 함수의 첫번째 파라미터는 항상 error를 담기 위한 자리로 error가 없다면 null을 담는다.
  */
  User.findOne({username : username}).select({password : 1}).exec(function(err, user) {
    if(err) {
      return done(err);
    }
    if(user && user.authenticate(password)) {
      return done(null, user);
    } else {
      req.flash("username", username);
      req.flash("errors", {login : "잘못된 사용자 이름 또는 비밀번호"});
      return done(null, false);
    }
  });
}));

module.exports = passport;
