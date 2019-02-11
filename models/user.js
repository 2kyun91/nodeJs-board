var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

/*
require에 true 대신 배열이 들어갔다, 배열을 사용해서 커스텀 에러메세지를 만들수 있다.
password에는 select:false가 추가되었다, default는 true인데 schema 항목을 DB에서 읽어온다.
false로 설정하면 DB에서 값을 읽어 올때 해당 값을 읽어오라고 하는 경우에만 읽어온다.
비밀번호 같은 정보는 중요하기 때문에 DB에서 값을 읽어오지 않게 설정한다.
*/
var userSchema = mongoose.Schema({
  username : {
    type : String,
    required : [true, "사용자명은 필수항목 입니다."],
    match : [/^.{4,12}$/,"4자 ~ 12자만 가능합니다!"], // 첫번째 파라미터 : 정규식, 두번째 파라미터 : 에러메세지
    trim : true, // 문자열 앞뒤에 빈칸이 있는경우 제거해주는 옵션이다.
    unique : true
  },
  password : {
    type : String,
    required : [true, "비밀번호는 필수항목 입니다."],
    select : false
  },
  name : {
    type : String,
    required : [true, "이름은 필수항목 입니다."],
    match : [/^.{2,12}$/,"4자 ~ 12자만 가능합니다!"],
    trim : true
  },
  email : {
    type : String,
    match : [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,"이메일 형식만 가능합니다!"],
    trim : true
  }
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
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = "최소 8자의 영문과 숫자 조합만 가능합니다!";
userSchema.path("password").validate(function(v) {
  var user = this; // this는 user model이다.

  // create user
  if(user.isNew) {
    // 조건에 만족하지 않는 경우 invalidate, model.invalidate 함수를 사용한다.
    // 첫번째 파라미터는 항목이름, 두번째 파라미터는 에러메세지
    if(!user.passwordConfirmation) {
      user.invalidate("passwordConfirmation", "비밀번호를 입력했는지 확인하세요!");
    }
    // if(user.password !== user.passwordConfirmation) {
    //   user.invalidate("passwordConfirmation", "비밀번호 확인이 일치하지 않습니다!");
    // }
    if(!passwordRegex.test(user.password)) {
      user.invalidate("password", passwordRegexErrorMessage);
    } else if(user.password !== user.passwordConfirmation) {
      user.invalidate("passwordConfirmation", "비밀번호 확인이 일치하지 않습니다!");
    }
  }

  // update user
  if(!user.isNew) {
    if(!user.currentPassword) {
      user.invalidate("currentPassword", "현재 비밀번호를 입력했는지 확인하세요!");
    }
    // if(user.currentPassword && user.currentPassword != user.originalPassword) {
    //   user.invalidate("currentPassword", "현재 비밀번호가 맞는지 확인하세요!");
    // }
    /*
    bcrypt의 compareSync 함수를 사용해서 저장된 hash와 입력받은 password의 hash가 일치하는지 확인한다.
    compareSync 함수의 첫번째 파라미터는 입력받은 text값이고 두번째 파라미터는 user의 password hash값이다.
    text값을 hash로 만들고 일치하는지 비교하는 과정이다.
    */
    if(user.currentPassword && !bcrypt.compareSync(user.currentPassword, user.originalPassword)) {
      user.invalidate("currentPassword", "현재 비밀번호가 맞는지 확인하세요!");
    }
    // if(user.newPassword !== user.passwordConfirmation) {
    //   user.invalidate("passwordConfirmation", "비밀번호 확인이 일치하지 않습니다!");
    // }
    if(user.newPassword && !passwordRegex.test(user.newPassword)) {
      user.invalidate("newPassword", passwordRegexErrorMessage);
    } else if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate("passwordConfirmation", "비밀번호 확인이 일치하지 않습니다!");
    }
  }
});

// hash password
/*
Schema.pre 함수는 첫번째 파라미터로 설정된 event가 일어나기 전에 먼저 콜백함수를 실행시킨다.
"save" 이벤트는 Model.create, Model.save 함수 실행시 발생하는 event이다.
즉, user를 생성하거나 수정한 뒤 save 함수를 실행할 때 콜백함수가 먼저 호출된다.
*/
userSchema.pre("save", function (next) {
  var user = this;
  // isModified 함수는 해당 값이 db에 기록된 값과 비교해서 변경된 경우 true, 그렇지 않은 경우 false를 return하는 함수이다.
  if(!user.isModified("password")) {
    return next();
  } else {
    // user.password의 값이 변경된 경우에는 bcrypt.hashSync 함수로 password를 hash값으로 바꾼다.
    // hash 알고리즘을 사용하여 값을 변환하면 초기 입력값을 알아내기란 거의 불가능하다.
    // 보안을 위해서는 초기값을 DB 서버에 저장하기 보다는 hash로 변환된 값을 저장하는것이 안전하다.
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
// user model의 password hash와 입력받은 password text를 비교하는 method 이다.
userSchema.methods.authenticate = function(password) {
  var user = this;
  return bcrypt.compareSync(password, user.password);
};

// model & exports
var User = mongoose.model("user", userSchema);
module.exports = User;
