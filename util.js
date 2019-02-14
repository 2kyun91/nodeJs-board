var util = {};

/*
routes/users.js 와 model/post.js에 있던 시간 관련 함수들을 module로 만들어 util.js로 분리했다.
*/

util.parseError = function(errors) {
  var parsed = {};
  if(errors.name == "ValidationError") {
    for(var name in errors.errors) {
      var ValidationError = errors.errors[name];
      parsed[name] = { message : ValidationError.message };
    }
  } else if(erros.code == "11000" && errors.errmsg.indexOf("username") > 0) {
    parsed.username = { message : "중복된 사용자명입니다!"};
  } else {
    parsed.unhandled = JSON.stringify(errors);
  }
  return parsed;
};

util.getDate = function(dateObj) {
  if(dateObj instanceof Date) {
    return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth() + 1) + "-" + get2digits(dateObj.getDate());
  }
};

util.getTime = function(dateObj) {
  if(dateObj instanceof Date) {
    return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes()) + ":" + get2digits(dateObj.getSeconds());
  }
};

// custom function
function get2digits(num) {
  return ("0" + num).slice(-2);
}

// 로그인 여부 판별 함수
// route에서 콜백으로 사용될 함수이다.
// 로그인 된 상태이면 다음 콜백함수를 호출, 로그인이 안된 상태이면 로그인 페이지로 redirect.
// isAuthenticated는 index.js 속에 req.locals에 등록한 변수이다.
util.isLoggedin = function(req, res, next) {
  if(req.isAuthenticated()) {
    next();
  } else {
    req.flash("errors", {login : "로그인이 필요합니다."});
    res.redirect("/login");
  }
};

// 접근권한이 없는 경우에 에러 메세지를 호출
// 접근권한이 있는지 없는지 판별하지는 않는다.
// 콜백으로 사용하지 않고 일반 함수로 사용한다.
util.noPermission = function(req, res) {
  req.flash("errors", {login : "접근권한이 없습니다."});
  req.logout();
  res.redirect("/login");
};

module.exports = util;
