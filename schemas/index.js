const mongoose = require("mongoose");

const connect = () => {
  mongoose
    .connect("mongodb://3.38.198.52:27017/hw_lv1")
    .then(() => {
      console.log("Connected to mongoDB");
    })
    .catch((err) => console.log(err));
};

mongoose.connection.on("error", (err) => {
  console.error("Failed to connect to mongoDB", err);
});

module.exports = connect;
