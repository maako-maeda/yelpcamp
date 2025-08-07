const mongoose = require("mongoose");
const campground = require("../models/campground");
const cities = require("./cities");
const { discriptors, places, descriptors } = require("./seedHelpers"); //分割代入して一つのオブジェクトに格納

mongoose
  .connect("mongodb://localhost:27017/yelpcamp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("connected");
  })
  .catch(() => {
    console.log("connection error");
    console.log(err);
  });

// 配列からランダム番目の要素を取得
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ランダムにデータを作成してDBに保存する
const seedDB = async () => {
  await campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const randomCityIndex = Math.floor(Math.random() * cities.length);
    const price = Math.floor(Math.random() * 2000) + 1000;
    const camp = new campground({
      author: "6867202d8ad44e3b98066729",
      location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
      title: `${sample(descriptors)}・${sample(places)}`,
      images: [
        {
          url: `https://picsum.photos/400?random=${Math.random()}`,
          filename: "yelpCamp",
        },
      ],
      description:
        "さよならジョバンニはまるで夢中で橋の方へ行って見よう。美しい美しい桔梗いろの空のすすきが、もうのどがつまってなんとも言えずに博士の前を通るのですからしかたありませんなその人はわらいました。川まではよほどありましょうかねえええ、ええ、ありがとうと言いました。船が遅れたんだカムパネルラは、車室の中の旅人たちはしずかに席にもたれて睡っていました。みんなは、一ぺんにまっくらになった水は見えなくなり、それと同時にぴしゃあんというつぶれたような鷺が、まるでひるまのように考えられてしかたなかったのです。",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  console.log("finished");
  mongoose.connection.close(); //コネクションを閉じる
});
