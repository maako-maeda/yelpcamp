const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");
const camgrounds = require("../controllers/campgrounds");
const { route } = require("./camground");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage }); //uploaded file is saved at uploads/

router
  .route("/")
  .get(catchAsync(camgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(camgrounds.showCampground)
  );
// .post(isLoggedIn, validateCampground, catchAsync(camgrounds.showCampground));

router.get("/new", isLoggedIn, camgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(camgrounds.showDetail))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(camgrounds.editCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(camgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(camgrounds.editForm));

module.exports = router;
