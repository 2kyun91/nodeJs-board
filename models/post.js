var mongoose = require("mongoose");
var util = require("../util");

// schema
var postSchema = mongoose.Schema({
  title : {type : String, required : [true, "제목은 필수항목!"]},
  body : {type : String, required : [true, "내용은 필수항목!"]},
  // default 항목으로 기본값을 지정할수 있다, 함수명을 넣으면 해당 함수의 return값이 기본값이 된다.
  createdAt : {type : Date, default : Date.now},
  updatedAt : {type : Date},
}, {
  // virtual들을 object에서 보여주는 mongoose schema의 option이다.
  toObject : {virtuals : true}
});

// virtuals
/*
postSchema.virtual함수를 이용해서 virtuals(가상항목)를 설정.
virtuals는 실제 DB에 저장되진 않지만 model에서는 db에 있는 다른 항목들과 동일하게 사용할 수 있다.
get, set 함수를 설정해서 어떻게 해당 virtual 값을 설정하고 불러올지를 정할 수 있다.
*/
postSchema.virtual("createdDate").get(function() {
  return util.getDate(this.createdAt);
});

postSchema.virtual("createdTime").get(function() {
  return util.getTime(this.createdAt);
});

postSchema.virtual("updatedDate").get(function() {
  return util.getDate(this.updatedAt);
});

postSchema.virtual("updatedTime").get(function() {
  return util.getTime(this.updatedAt);
});

// model & export
var Post = mongoose.model("post", postSchema);
module.exports = Post;

// // functions
// function getDate(dateObj) {
//   if(dateObj instanceof Date) {
//     return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth() + 1) + "-" + get2digits(dateObj.getDate());
//   }
// }
//
// function getTime(dateObj){
//  if(dateObj instanceof Date)
//   return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes())+ ":" + get2digits(dateObj.getSeconds());
// }
//
// function get2digits(num) {
//   return ("0" + num).slice(-2);
// }
