const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/expressError");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");
const users = require("../controllers/user");

router.route("/register").get(users.renderRegister).post(users.login);

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    // storeReturnTo ミドルウェアで session から res.locals へ returnTo を移す
    storeReturnTo,
    // passport.authenticate が実行されると req.session がクリアされる
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    // ここで res.locals.returnTo を使ってログイン後のページへリダイレクト
    users.flash
  );

router.get("/logout", users.logout);

module.exports = router;
