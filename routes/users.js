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
  res.render("users/new", {user : {}});
});

// Create
router.post("/", function(req, res) {
  User.create(req.body, function(err, user) {
    if(err) {
      return res.json(err);
    }
    res.redirect("users/");
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
router.get("/:username/edit", function(req, res) {
  User.findOne({username : req.params.username}, function(err, user) {
    if(err) {
      return res.json(err);
    }
    res.render("users/edit", {user : user});
  });
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
  User.findOne({username : req.params.username}).select("password").exec(function(err, user) {
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
        return res.json(err);
      }
      res.redirect("/users/" + user.username);
    });
  });
});

module.exports = router;
