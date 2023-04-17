const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: { type: String, required: true },
  title: { type: String, required: true },
  password: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

postSchema.virtual("postId").get(function () {
  return this._id.toHexString();
});

postSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);