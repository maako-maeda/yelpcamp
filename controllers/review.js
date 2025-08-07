const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "レビューを保存しました");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  // campground（親要素）にリストされていた子のIDを削除
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  // 子のデータベースからIDの合致するデータを削除
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "レビューを削除しました");
  res.redirect(`/campgrounds/${id}`);
};
