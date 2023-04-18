const express = require("express");
const router = express.Router();

const Post = require("../schemas/post");

// 게시글 작성
router.post("/posts", async (req, res) => {
  const { user, password, title, content } = req.body;

  if (
    Object.keys(req.body).length !== 4 ||
    user === "" ||
    password === "" ||
    title === "" ||
    content === ""
  ) {
    return res.status(400).json({
      message:
        "데이터 형식이 올바르지 않습니다.(작성자, 제목, 비밀번호, 내용을 입력하세요)",
    });
  }

  await Post.create({
    user,
    title,
    password,
    content,
  });

  res.json({ message: "게시글을 생성하였습니다." });
});

// 전체 게시글 목록 조회
router.get("/posts", async (req, res) => {
  const posts = await Post.find({});

  if (!posts.length)
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });

  posts.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  const postsWithoutPasswords = [];

  posts.forEach((post) => {
    const withoutPassword = {
      postId: post._id.toString(),
      user: post.user,
      title: post.title,
      createAt: post.createdAt,
    };
    postsWithoutPasswords.push(withoutPassword);
  });

  res.status(200).json({ data: postsWithoutPasswords });
});

// 게시글 상세 조회
router.get("/posts/:_postId", async (req, res) => {
  const { _postId } = req.params;

  try {
    const post = await Post.findOne({ _id: _postId });

    if (!post)
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });

    const postWithoutPassword = {
      postId: post._id.toString(),
      user: post.user,
      title: post.title,
      content: post.content,
      createAt: post.createdAt,
    };
    res.status(200).json({ data: postWithoutPassword });
  } catch (e) {
    return res
      .status(400)
      .json({ message: "게시글 조회에 실패하였습니다. " + e.message });
  }
});

// 게시글 수정
router.put("/posts/:_postId", async (req, res) => {
  const { _postId } = req.params;

  try {
    const post = await Post.findOne({ _id: _postId });

    if (!post)
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });

    const { password, title, content } = req.body;

    if (Object.keys(req.body).length !== 3 || title === "" || content === "")
      return res
        .status(400)
        .json({ message: "비밀번호와 수정할 제목/내용을 입력하세요." });

    if (post.password !== password)
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });

    await Post.updateOne(
      { _id: _postId },
      { $set: { title: title, content: content } }
    );

    res.status(200).json({ message: "게시글을 수정하였습니다." });
  } catch (e) {
    res
      .status(400)
      .json({ message: "게시글 조회에 실패하였습니다. " + e.message });
  }
});

// 게시글 삭제
router.delete("/posts/:_postId", async (req, res) => {
  const { _postId } = req.params;

  try {
    const post = await Post.findOne({ _id: _postId });

    if (!post)
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });

    const { password } = req.body;

    if (Object.keys(req.body).length !== 1)
      return res.status(400).json({ message: "비밀번호를 입력하세요." });

    if (post.password !== password)
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });

    await Post.deleteOne({ _id: _postId });

    return res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (e) {
    return res
      .status(400)
      .json({ message: "게시글 조회에 실패하였습니다. " + e.message });
  }
});

module.exports = router;
