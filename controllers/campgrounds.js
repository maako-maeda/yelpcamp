const campground = require("../models/campground");
const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary/index");

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.showCampground = async (req, res) => {
  // if (!req.body.campground) throw new ExpressError("bad request", 400);

  const campground = new Campground(req.body.campground);
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  req.flash("success", "新しいキャンプ場を登録しました");
  res.redirect(`campgrounds/${campground._id}`);
};

module.exports.showDetail = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "キャンプ場は見つかりませんでした");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.editForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id); //paramsだけだとオブジェクトで返される
  if (!campground) {
    req.flash("error", "キャンプ場は見つかりませんでした");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.editCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.files);
  const camp = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const img = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  camp.images.push(...img);
  await camp.save();
  console.log("Done");
  if (req.body.deleteImages) {
    for (let f of req.body.deleteImages) {
      await cloudinary.uploader.destroy(f);
    }
    await camp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "キャンプ場を更新しました");
  res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "キャンプ場を削除しました");
  res.redirect("/campgrounds");
};
