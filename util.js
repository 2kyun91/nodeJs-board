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

module.exports = util;

// custom function
function get2digits(num) {
  return ("0" + num).slice(-2);
}
