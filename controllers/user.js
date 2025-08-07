const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registereduser = await User.register(user, password);
    req.login(registereduser, (err, next) => {
      if (err) return next(err);
      req.flash("success", "yelpCampへようこそ");
      res.redirect("/campgrounds");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "ログアウトしました");
    res.redirect("/campgrounds");
  });
};

module.exports.flash = (req, res) => {
  req.flash("success", "おかえりなさい！！");
  const redirectUrl = res.locals.returnTo || "/campgrounds"; // ここを res.locals.returnTo に変更
  res.redirect(redirectUrl);
};
