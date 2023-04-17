const express = require("express");
const router = express.Router();

const Comment = require("../schemas/comment");

// 댓글 작성
//   댓글 내용을 비워둔 채 댓글 작성 API를 호출하면 "댓글 내용을 입력해주세요"라는 메세지를 return하기
router.post("/", async (req, res) => {
  if (Object.keys(req.body).length < 3) {
    return res.status(400).json({
      message:
        "데이터 형식이 올바르지 않습니다.(작성자, 비밀번호, 내용을 입력하세요)",
    });
  }

  const { user, password, content } = req.body;
  if (user === "" || password === "" || content === "")
    return res.status(400).json({ message: "댓글 내용을 입력해주세요." });

  await Comment.create({
    user: user,
    password: password,
    content: content,
  });

  res.status(200).json({ message: "댓글을 생성하였습니다." });
});

// 댓글 목록 조회
//   조회하는 게시글에 작성된 모든 댓글을 목록 형식으로 볼 수 있도록 하기 (날짜 기준 내림차순)
router.get("/", async (req, res) => {
  const comments = await Comment.find({});
  if (!comments.length)
    return res.status(404).json({ message: "댓글이 존재하지 않습니다." });

  comments.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  const commentsWithoutPasswords = [];

  comments.forEach((comment) => {
    const withoutPassword = (({ commentId, user, content, createdAt }) => ({
      commentId,
      user,
      content,
      createdAt,
    }))(comment);
    commentsWithoutPasswords.push(withoutPassword);
  });

  return res.status(200).json({ data: commentsWithoutPasswords });
});

// 댓글 수정
//   댓글 내용을 비워둔 채 댓글 수정 API를 호출하면 "댓글 내용을 입력해주세요"라는 메세지를 return하기
router.put("/:_commentId", async (req, res) => {
  const { _commentId } = req.params;
  try {
    const comment = await Comment.findOne({ _id: _commentId });
    if (!comment)
      return res.status(404).json({ message: "댓글 조회에 실패하였습니다." });

    const { password, content } = req.body;
    if (comment.password !== password)
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    if (content === "")
      return res.status(400).json({ message: "댓글 내용을 입력해주세요." });

    await Comment.updateOne(
      { _id: _commentId },
      { $set: { content: content } }
    );

    return res.status(200).json({ message: "댓글을 수정하였습니다." });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
});

// 댓글 삭제
//   원하는 댓글 삭제하기
router.delete("/:_commentId", async (req, res) => {
  const { _commentId } = req.params;
  try {
    const comment = await Comment.findOne({ _id: _commentId });
    if (!comment)
      return res.status(404).json({ message: "댓글 조회에 실패하였습니다." });

    const { password, content } = req.body;
    if (comment.password !== password)
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    if (content === "")
      return res.status(400).json({ message: "댓글 내용을 입력해주세요." });

    await Comment.deleteOne({ _id: _commentId });

    return res.status(200).json({ message: "댓글을 삭제하였습니다." });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
});

module.exports = router;
