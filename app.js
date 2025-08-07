if (process.env.NODE_ENV !== "production") {
  //nodeの本番環境ではnode_envにproductionと記載される
  require("dotenv").config(); //本番環境ではない場合ローカルの環境変数を参照する
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const engine = require("ejs-mate");
const ExpressError = require("./utils/expressError");
// const { title } = require("process");
const campgroundRouts = require("./routes/camground");
const reviewRoutes = require("./routes/reviews");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const passportLocal = require("passport-local");
const User = require("./models/user");
const LocalStrategy = require("passport-local").Strategy;
const userRoutes = require("./routes/users");
const multer = require("multer");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

mongoose
  .connect("mongodb://localhost:27017/yelpcamp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connected");
  })
  .catch(() => {
    console.log("connection error");
    console.log(err);
  });

//app.useはすべてのリクエストに対して実行する処理を書く。第一引数にpathを指定することもできる。
app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); //req.bodyを読み込んでフォームからの内容を読み込めるようになる
app.use(methodOverride("_method"));
app.use(morgan("dev"));
// app.use(mongoSanitize({ replaceWith: "_" }));
// app.use(helmet());

const sessionConfig = {
  secret: "mysecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure:true, <-HTTPSのみしかクッキーをやり取りしない　ローカルではHTTPなのでコメントアウト
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("home");
});

app.use("/campgrounds", campgroundRouts);

app.use("/campgrounds/:id/reviews", reviewRoutes);

app.use("/", userRoutes);

// Express v5ではワイルドカードは/*splat←こう書く
app.all("/*splat", (req, res, next) => {
  next(new ExpressError("Not found", 404));
});

// エラーハンドラは必ず最後に書く。catch{next(e)}でここに飛ぶ
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Something wrong";
  }
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Port 3000...");
});
