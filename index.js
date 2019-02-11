var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");

/*
route간의 정보 전달을 위해 flash를 사용한다.
flash는 변수처럼 이름을 정하고 값(어떤 형태의 값도 사용 가능)을 저장할 수 있는데 한번 생성되면 사용될 때까지 서버에 저장되어 있다가 한번 사용되면 사라지는 형태의 data이다.
connect-flash를 사용하기 위해서는 express-session 패키지가 필요하다.
*/
var flash = require("connect-flash");
var session = require("express-session");

var app = express();

// DB 세팅
mongoose.connect(process.env.MONGO_DB, {useNewUrlParser:true});
var db = mongoose.connection;

db.once("open", function() {
  console.log("DB connected");
});

db.on("error", function(err) {
  console.log("DB error : " + err);
});

// ejs 세팅
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(methodOverride("_method"));
/*
flash를 초기화한다, 이제부터 req.flash라는 함수를 사용할 수 있다.
req.flash(문자열, 저장할 값)의 형태로 저장할 값을 해당 문자열에 저장한다.
flash는 배열로 저장되기 때문에 같은 문자열을 중복해서 사용하면 순서대로 배열로 저장된다.
req.flash(문자열)인 경우 해당 문자열에 저장된 값들을 배열로 불러온다.
저장된 값이 없다면 빈 배열을 return한다.
*/
app.use(flash());
/*
session은 서버에서 접속자를 구분시키는 역할을 한다.
secret 옵션은 hash를 생성하는데 사용되는 값으로 비밀번호 정도로 생각하면 된다.
*/
app.use(session({secret : "MySecret", resave : true, saveUninitialized : true}));

// Routes
app.use("/", require("./routes/home"));
app.use("/posts", require("./routes/posts"));
app.use("/users", require("./routes/users"));

// port 세팅
app.listen(3000, function() {
  console.log("server on!");
});
