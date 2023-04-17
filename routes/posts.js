const express = require("express");
const router = express.Router();
const commentsRouter = require("./comments");

const Post = require("../schemas/post");

router.use("/posts/:_postId/comments", [commentsRouter]);

// 게시글 작성
//   제목, 작성자명, 비밀번호, 작성 내용 입력
router.post("/posts", async (req, res) => {
  if (Object.keys(req.body).length < 4) {
    return res.status(400).json({
      message:
        "데이터 형식이 올바르지 않습니다.(작성자, 제목, 비밀번호, 내용을 입력하세요)",
    });
  }

  const { user, password, title, content } = req.body;
  if (user === "" || password === "" || title === "" || content === "") {
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
//   제목, 작성자명, 작성 날짜 조회하기 (작성 날짜 기준으로 내림차순)
router.get("/posts/", async (req, res) => {
  const posts = await Post.find({});
  if (!posts.length)
    return res.status(404).json({ message: "게시글이 존재하지 않습니다." });

  posts.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  const postsWithoutPasswords = [];

  posts.forEach((post) => {
    const withoutPassword = (({ postId, user, title, createdAt }) => ({
      postId,
      user,
      title,
      createdAt,
    }))(post);
    postsWithoutPasswords.push(withoutPassword);
  });

  res.status(200).json({ data: postsWithoutPasswords });
});

// 게시글 상세 조회
//   제목, 작성자명, 작성 날짜, 작성 내용 조회
router.get("/posts/:_postId", async (req, res) => {
  const { _postId } = req.params;
  try {
    const post = await Post.findOne({ _id: _postId });
    if (!post)
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });

    const postWithoutPassword = (({
      postId,
      user,
      title,
      content,
      createdAt,
    }) => ({
      postId,
      user,
      title,
      content,
      createdAt,
    }))(post);
    res.status(200).json({ data: postWithoutPassword });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
});

// 게시글 수정
//   API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글 수정
router.put("/posts/:_postId", async (req, res) => {
  const { _postId } = req.params;
  try {
    const post = await Post.findOne({ _id: _postId });
    if (!post)
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });

    const { password, title, content } = req.body;
    if (post.password !== password)
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });

    await Post.updateOne(
      { _id: _postId },
      { $set: { title: title, content: content } }
    );

    res.status(200).json({ message: "게시글을 수정하였습니다." });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// 게시글 삭제
//   API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글 삭제
router.delete("/posts/:_postId", async (req, res) => {
  const { _postId } = req.params;
  try {
    const post = await Post.findOne({ _id: _postId });
    if (!post)
      return res.status(404).json({ message: "게시글 조회에 실패하였습니다." });

    const { password } = req.body;
    if (post.password !== password)
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });

    await Post.deleteOne({ _id: _postId });

    return res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
});

module.exports = router;
