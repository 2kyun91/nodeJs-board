var mongoose = require("mongoose");

/*
require에 true 대신 배열이 들어갔다, 배열을 사용해서 커스텀 에러메세지를 만들수 있다.
password에는 select:false가 추가되었다, default는 true인데 schema 항목을 DB에서 읽어온다.
false로 설정하면 DB에서 값을 읽어 올때 해당 값을 읽어오라고 하는 경우에만 읽어온다.
비밀번호 같은 정보는 중요하기 때문에 DB에서 값을 읽어오지 않게 설정한다.
*/
var userSchema = mongoose.Schema({
  username : {type : String, required : [true, "이름은 필수항목 입니다."], unique : true},
  password : {type : String, required : [true, "비밀번호는 필수항목 입니다."], select : false},
  name : {type : String, required : [true, "Name is required"]},
  email : {type : String}
}, {
  toObject : {virtuals : true}
});

// virtuals
/*
회원가입, 정보 수정시 password가 필요하다.
DB에 저장되지 않아도 되는 정보들은 virtual로 만든다.
*/
userSchema.virtual("passwordConfirmation")
.get(function(){
  return this._passwordConfirmation;
}).set(function(value) {
  this._passwordConfirmation = value;
});

userSchema.virtual("originalPassword")
.get(function() {
  return this._originalPassword;
}).set(function(value) {
  this._originalPassword = value;
});

userSchema.virtual("currentPassword")
.get(function() {
  return this._currentPassword;
}).set(function(value) {
  this._currentPassword = value;
});

userSchema.virtual("newPassword")
.get(function() {
  return this._newPassword;
}).set(function(value) {
  this._newPassword = value;
});

// password validation
/*
비밀번호 유효성 체크 함수
*/
userSchema.path("password").validate(function(v) {
  var user = this; // this는 user model이다.

  // create user
  if(user.isNew) {
    // 조건에 만족하지 않는 경우 invalidate, model.invalidate 함수를 사용한다.
    // 첫번째 파라미터는 항목이름, 두번째 파라미터는 에러메세지
    if(!user.passwordConfirmation) {
      user.invalidate("passwordConfirmation", "비밀번호를 입력했는지 확인하세요!");
    }

    if(user.password !== user.passwordConfirmation) {
      user.invalidate("passwordConfirmation", "비밀번호 확인이 일치하지 않습니다!");
    }
  }

  // update user
  if(!user.isNew) {
    if(!user.currentPassword) {
      user.invalidate("currentPassword", "현재 비밀번호를 입력했는지 확인하세요!");
    }
    if(user.currentPassword && user.currentPassword != user.originalPassword) {
      user.invalidate("currentPassword", "현재 비밀번호가 맞는지 확인하세요!");
    }
    if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate("passwordConfirmation", "비밀번호 확인이 일치하지 않습니다!");
    }
  }
});

// model & exports
var User = mongoose.model("user", userSchema);
module.exports = User;
