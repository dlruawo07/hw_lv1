const express = require("express");
const router = express.Router();
const commentsRouter = require("./comments");

const Post = require("../schemas/post");

router.use("/posts/:_postId/comments", [commentsRouter]);

// TODO:
//       1. return을 하는게 맞는지???
//       2. 예외처리 잘 생각해보기
//       3. find나 select로 원하는 필드만 가져오는 거 알아보기

// 게시글 작성
//   제목, 작성자명, 비밀번호, 작성 내용 입력
router.post("/posts", async (req, res) => {
  if (Object.keys(req.body).length < 4) {
    res.status(400).json({
      message:
        "데이터 형식이 올바르지 않습니다.(작성자, 제목, 비밀번호, 내용을 입력하세요)",
    });
    return;
  }

  const { user, password, title, content } = req.body;
  if (user === "" || password === "" || title === "" || content === "") {
    res.status(400).json({
      message:
        "데이터 형식이 올바르지 않습니다.(작성자, 제목, 비밀번호, 내용을 입력하세요)",
    });
    return;
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
  if (!posts.length) {
    res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    return;
  }
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
  const post = await Post.findOne({ _id: _postId });
  if (!post) {
    res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    return;
  }

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
});

// 게시글 수정
//   API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글 수정
router.put("/posts/:_postId", async (req, res) => {
  const { _postId } = req.params;
  const post = await Post.findOne({ _id: _postId });
  if (!post) {
    res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    return;
  }

  const { password, title, content } = req.body;
  if (post.password !== password) {
    res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    return;
  }

  await Post.updateOne(
    { _id: _postId },
    { $set: { title: title, content: content } }
  );

  res.status(200).json({ message: "게시글을 수정하였습니다." });
});

// 게시글 삭제
//   API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글 삭제
router.delete("/posts/:_postId", async (req, res) => {
  const { _postId } = req.params;
  const post = await Post.findOne({ _id: _postId });
  if (!post) {
    res.status(404).json({ message: "게시글 조회에 실패하였습니다." });
    return;
  }

  const { password } = req.body;
  if (post.password !== password) {
    res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    return;
  }

  await Post.deleteOne({ _id: _postId });

  res.status(200).json({ message: "게시글을 삭제하였습니다." });
});

module.exports = router;
