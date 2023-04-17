const mongoose = require("mongoose");

const connect = () => {
  mongoose
    // .connect("mongodb://3.38.167.244:27017/hw_lv1")
    .connect("mongodb://localhost:27017/hw_lv1")
    .then(() => {
      console.log("Successfully connected to Mongo");
    })
    .catch((err) => console.log(err));
};

mongoose.connection.on("error", (err) => {
  console.error("Failed to connect to Mongo", err);
});

module.exports = connect;
