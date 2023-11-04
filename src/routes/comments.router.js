import express from "express";
import { prisma } from "../utils/prisma/index.js";
// import joi from "joi";

const router = express.Router();
// const reviewsSchema = joi.object({
//   //bookTitle: joi.string().min(3).max(30).required().label("올바르지 않은 형식입니다."),
//   //title: joi.string().min(3).max(30).required(),
//   content: joi.string().min(3).max(30).required().label("올바르지 않은 형식입니다."),
//   author: joi.string().min(3).max(30).required().label("올바르지 않은 형식입니다."),
//   //starRating: joi.number().min(1).max(30).required(),
//   password: joi.string().min(1).max(30).required().label("올바르지 않은 형식입니다."),
// });

// 댓글 등록
router.post("/reviews/:reviewId/comments", async (req, res, next) => {
    try {
        const { content, author, password } = req.body;
        const { reviewId } = req.params;
        const reviews = await prisma.reviews.findFirst({
          where: { reviewId: +reviewId }
        });
        if (!reviewId) {
          return res.status(401).json({ message: '데이터 형식이 올바르지 않습니다.' })
        } else if (!reviews) {
          return res.status(404).json({ message: '존재하지 않는 리뷰입니다.' })
        } else if (!content) {
          return res.status(404).json({ message: '댓글 내용을 입력해주세요' })
        }
        const comments = await prisma.comments.create({
          data: {
            content,
            reviewId: +reviewId,
            author,
            password
          }
        });
        return res.status(200).json({ message: '댓글을 등록하였습니다.' })
        // return res.status(200).json({ data : comments })
      } catch (error) {
        return res.status(400).json({ error:error.message })
      };
    });
// 댓글 목록 조회 API
router.get('/reviews/:reviewId/comments', async (req, res) => {
    try {
      const { commentId, content, author, password } = req.body;
      const { reviewId } = req.params;

      const reviews = await prisma.reviews.findFirst({
        where: { reviewId: +reviewId }
      });
      if (!reviewId) {
        return res.status(401).json({ message: '데이터 형식이 올바르지 않습니다.' })
      } else if (!reviews) {
        return res.status(404).json({ message: '존재하지 않는 리뷰입니다.' })
      }
      const comments = await prisma.comments.findMany({
        where: { reviewId: +reviewId },
        select: {
          commentId: true,
          content: true,
          createdAt: true,
          updatedAt: true
        }
      });
      return res.status(200).json({ data: comments })
    } catch (error) {
      return res.status(400).json({ error })
    };
  });

// 댓글 수정 API
router.put("/reviews/:reviewId/comments/:commentId", async (req, res, next) => {
  try {
    const { reviewId, commentId } = req.params;
    const { content,  password } = req.body;

    const reviews = await prisma.reviews.findFirst({
      where: { reviewId: + reviewId, password },
    });
    const comments = await prisma.comments.findFirst({
        where: { commentId: +commentId, password }
    })
    if (!reviewId) {
        return res.status(401).json({ message: 'reviewsId 데이터 형식이 올바르지 않습니다.' })
      } else if (!reviews) {
        return res.status(404).json({ message: '존재하지 않는 리뷰입니다.' })
      } else if (!password) {
        return res.status(401).json({ message: '비밀번호를 입력해주세요.' })
      } else if (reviews.password !== password) {
        return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' })
      } else if (!commentId) {
        return res.status(401).json({ message: 'commentId 데이터 형식이 올바르지 않습니다.' })
      } else if (!comments) {
        return res.status(404).json({ message: '존재하지 않는 댓글입니다.' })
      } else if (!content) {
        return res.status(404).json({ message: '댓글 내용을 입력해주세요' })
      }

    await prisma.comments.update({
      data: { content },
      where: { reviewId: +reviewId, commentId: +commentId,password },
    });
    return res.status(200).json({ data: "댓글이 수정 되었습니다." });
  } catch (error) {
    return res.status(404).json({ error });
  }
});
// 댓글 delete API
router.delete("/reviews/:reviewId/comments/:commentId", async (req, res, next) => {
    try {
    const { reviewId, commentId } = req.params;
    const { password } = req.body;

    const reviews = await prisma.reviews.findFirst({
      where: { reviewId: +reviewId },
    });
    const comments = await prisma.comments.findFirst({
      where: { commentId: +commentId, password }
        })

          if (!reviews) {
            return res.status(404).json({ message: '존재하지 않는 리뷰입니다.' })
          } else if (!password) {
            return res.status(401).json({ message: '비밀번호를 입력해주세요.' })
          } else if (reviews.password !== password) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' })
        } else if (!comments) {
            return res.status(404).json({ message: '존재하지 않는 댓글입니다.' })
          }
    
      await prisma.comments.delete({
        where: { reviewId: +reviewId, commentId: +commentId }
      });
      return res.status(200).json({ data: "댓글 삭제되었습니다." });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
);

export default router;
