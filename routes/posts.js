var express = require("express");
var router = express.Router();
var Post = require("../models/Post");
var util = require("../util");

// Index
router.get("/", function(req, res) {
  // 나중에 생성된 data가 위로 오도록 설정한다.
  // find와 function 사이에 sort함수가 들어간 형태이다.
  // exec 함수 앞에 DB에서 데이터를 어떻게 찾을지, 어떻게 정렬할지 등을 함수로 정의하고
  // exec안의 함수에서 해당 data를 받아와서 할일을 정하는 구조이다.
  // 내림차순으로 정렬할 경우 -를 앞에 붙여준다, 두가지 이상으로 정렬하는 경우 빈칸을 넣고 각각의 항목을 적어주면 된다.
  // object를 넣는 경우 "{createdAt : 1}" 식으로 넣어주면 된다.
  Post.find({}).sort("-createdAt").exec(function(err, posts){
    if(err) {
      return res.json(err);
    }
    res.render("posts/index", {posts : posts});
  });
});

// New
router.get("/new", function(req, res) {
  var post = req.flash("post")[0] || {};
  var errors = req.flash("errors")[0] || {};
  res.render("posts/new", {post : post, errors : errors});
});

// create
router.post("/", function(req, res) {
  Post.create(req.body, function(err, post) {
    if(err) {
      req.flash("post", req.body);
      req.flash("errors", util.pasreError(err));
      return res.redirect("/posts/new");
    }
    res.redirect("/posts");
  });
});

// Show
router.get("/:id", function(req, res) {
  Post.findOne({_id : req.params.id}, function(err, post) {
    if(err) {
      return res.json(err);
    }
    res.render("posts/show", {post : post});
  });
});

// edit
router.get("/:id/edit", function(req, res) {
  var post = req.flash("post")[0];
  var errors = req.flash("errors")[0] || {};
  if(!post) {
    Post.findOne({_id : req.params.id}, function(err, post) {
      if(err) {
        return res.json(err);
      }
      res.render("posts/edit", {post : post, errors : errors});
    });
  } else {
    post._id = req.params.id;
    res.render("posts/edit", {post : post, errors : errors});
  }
});

// update
router.put("/:id", function(req, res) {
  // data 수정시 수정된 날짜를 업데이트한다.
  req.body.updatedAt = Date.now();
  // findOneAndUpdate는 기본설정이 schema에 있는 validation을 작동하지 않기 때문에 이 옵션을 통해서 validation이 작동하도록 설정해 주어야 한다.
  Post.findOneAndUpdate({_id : req.params.id}, req.body, {runValidators : true}, function(err, post) {
    if(err) {
      req.flash("post", req.body);
      req.flash("errors", util.parseError(err));
      return res.redirect("/posts/" + req.params.id + "/edit");
    }
    res.redirect("/posts/" + req.params.id);
  });
});

// destroy
router.delete("/:id", function(req, res) {
  Post.remove({_id : req.params.id}, function(err) {
    if(err) {
      return res.json(err);
    }
    res.redirect("/posts");
  });
});

module.exports = router;
