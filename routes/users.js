var express = require("express");
var router = express.Router();
var User = require("../models/user");

// Index
router.get("/", function(req, res) {
  /*
  찾을 조건 find({})는 모든 값.
  sort 함수에는 "{username:1}" 기준으로 오름차순, -1은 내림차순
  콜백함수가 find 함수 밖으로 나오게 되면 exec(callback_함수)를 사용한다.
  sort가 없을 때는 콜백함수가 find함수에 파라미터로 들어간다.
  sort 말고도 다양한 함수들이 끼어들 수 있다.
  */
  User.find({}).sort({username : 1}).exec(function(err, users) {
    if(err) {
      return res.json(err);
    }
    res.render("users/index", {users : users});
  });
});

// New
router.get("/new", function(req, res) {
  var user = req.flash("user")[0] || {}; // 처음 new 페이지에 들어온 경우에는 빈 object를 넣어 페이지를 생성한다.
  var errors = req.flash("errors")[0] || {};
  res.render("users/new", {user : user, errors : errors});
});

// Create
router.post("/", function(req, res) {
  User.create(req.body, function(err, user) {
    // user 생성시에 오류가 있다면 user,error flash를 만들어 new 페이지로 redirect한다.
    if(err) {
      req.flash("user", req.body);
      req.flash("errors", parseError(err));
      return res.redirect("/users/new");
    }
    res.redirect("/users/");
  });
});

// Show
router.get("/:username", function(req, res) {
  User.findOne({username : req.params.username}, function(err, user) {
    if(err) {
      return res.json(err);
    }
    res.render("users/show", {user : user});
  });
});

// Edit
/*
edit은 처음 접속하는 경우에는 DB에서 값을 찾아 form에 기본값을 생성하고 update에서 오류가 발생해 돌아오는 경우에는 기존에 입력했던 값으로 form에 값들을 생성해야 한다.
이를 위해 user에는  || {}를 사용하지 않고 user flash 값에 따라 오류의 여부를 체크한다.
req.params.username은 주소에서 찾은 username이다.
*/
router.get("/:username/edit", function(req, res) {
  var user = req.flash("user")[0];
  var errors = req.flash("errors")[0] || {};
  if(!user) {
    User.findOne({username : req.params.username}, function(err, user) {
      if(err) {
        return res.json(err);
      }
      res.render("users/edit", {username : req.params.username, user : user, errors : errors});
    });
  } else {
    res.render("users/edit", {username : req.params.username, user : user, errors : errors});
  }
});

// Update
router.put("/:username", function(req, res, next) {
  /*
  findOneAndUpdate 대신에 findOne으로 값을 찾은 후에 값을 수정하고 user.save함수로 값을 저장한다.
  select 함수를 이용해 DB에서 어떤 항목을 선택할지 안할지 정할 수 있다.
  user schema에서 password의 select를 false로 설정했으니 DB에 password가 있더라도 기본적으로 password를 읽어오지 않는데(개인정보 보안의 이유로) select 함수로 password 항목을 선택한다.
  항목 이름 앞에 -를 붙이면 안 읽어온다.
  여러 항목을 동시에 정할 수도 있는데 select("password -name") 이런식으로 사용한다.
  */
  User.findOne({username : req.params.username}).select({password : 1}).exec(function(err, user) {
    if(err) {
      return res.json(err);
    }

    // update user object
    user.originalPassword = user.password;
    user.password = req.body.newPassword ? req.body.newPassword : user.password; // 비밀번호 update 여부 체크
    for(var p in req.body) {
      // user는 DB에서 읽어온 data이고 req.body가 실제 form에 입력된 값이므로 각 항목을 덮어쓴다.
      user[p] = req.body[p];
    }

    // save updated user
    user.save(function(err, user) {
      if(err) {
        req.flash("user", req.body);
        req.flash("errors", parseError(err));
        return res.redirect("/users/" + req.params.username + "/edit");
      }
      res.redirect("/users/" + user.username);
    });
  });
});

module.exports = router;

// Function
/*
user 생성시에 발생할 수 있는 오류는 여러가지(error 객체의 형식이 상이)이므로 parseError라는 함수를 따로 만들어서 err을 분석하고 일정한 형식으로 만든다.
mongoose, mongoDB에서 내는 에러의 형태가 다르기 때문에 "{항목이름 : {message : '에러메세지'}}"로 통일시켜주는 함수이다.
*/
function parseError(errors) {
  console.log("errors : " + errors); // 원래 에러의 형태.
  var parsed = {};
  if(errors.name == "ValidationError") { // mongoose의 model validation error
    for(var name in errors.errors) {
      var validationError = errors.errors[name];
      parsed[name] = {message : validationError.message};
    }
  } else if(errors.code == "11000" && errors.errmsg.indexOf("username") > 0) { // mongoDB에서 username이 중복되는 error
    parsed.username = {message : "중복된 사용자명입니다!"};
  } else { // 그 외 error
    parsed.unhandled = JSON.stringify(errors);
  }
  return parsed;
}
