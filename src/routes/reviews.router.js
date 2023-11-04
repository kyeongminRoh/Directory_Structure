import express from "express";
import { prisma } from "../utils/prisma/index.js";
import joi from "joi"

const router = express.Router();
const reviewsSchema = joi.object({
  bookTitle: joi.string().min(3).max(30).required().label("올바르지 않은 형식입니다."),
  title: joi.string().min(3).max(30).required(),
  content: joi.string().min(3).max(30).required(),
  author: joi.string().min(3).max(30).required(),
  starRating: joi.number().min(1).max(30).required(),
  password: joi.string().min(1).max(30).required(),
})



router.post("/reviews", async (req, res, next) => {
  try {
    const validation = await reviewsSchema.validateAsync(req.body)
    const { bookTitle, title, content, starRating, author, password } = validation; 
    
    const reviews = await prisma.reviews.create({
      data: {
      bookTitle,
      title,
      content,
      starRating,
      author,
      password,
      }
  });
    return res.status(201).json({ Message: "책 리뷰를 등록하였습니다." });
  } catch (error) {
    next(error)
  }
});
// 리뷰 목록 조회 API
router.get("/reviews", async (req, res) => {
  const reviews = await prisma.reviews.findMany({
    select: {
      reviewId: true,
      bookTitle: true,
      title: true,
      author: true,
      starRating: true,
    },
  });
  return res.status(200).json({ data: reviews });
});
// 리뷰 상세조회 API
router.get('/reviews/:reviewId', async(req, res, next) => {
  try {
    const { reviewId } = req.params;
    const reviews = await prisma.reviews.findFirst({
      where: { reviewId: +reviewId },
      select: {
        bookTitle: true,
        title: true,
        content: true,
        author: true,
        starRating: true
      }
    
  })
if (!reviews) {
  return res.status(400).json({ errorMessage: "데이터를 형식이 올바르지 않습니다." })
}
  return res.status(200).json({ data: reviews })
} catch (error) {
  next(error)
}
})
// 수정 API
router.put('/reviews/:reviewId', async(req, res, next) => {
    try{
      const { reviewId } = req.params;
      const validation = await reviewsSchema.validateAsync(req.body)
  const {
    bookTitle,
    title,
    content,
    starRating,
    password,
  } = validation;
  const reviews = await prisma.reviews.findUnique({
    
    where: {
      reviewId: +reviewId
    }
  })
  if (!reviews) {
    return res.status(404).json ({errorMessage: "게시글이 존재하지 않습니다." })
  } else if (reviews.password !== password ) {
    return res.status(401).json({errorMessage: "비밀번호가 일치하지 않습니다." })
  }
  await prisma.reviews.update({
    data: { 
      bookTitle,
      title,
      content,
      starRating,
      password
    },
    where: {
      reviewId: +reviewId,
      password
    }
  })
  return res.status(200).json({ data: "게시글 수정 되었습니다." })
} catch (error) {
  next(error)
}
})
// delete API
router.delete('/reviews/:reviewId', async(req, res, next) => {
  try {
  const { reviewId } = req.params;
  const { password } = req.body;
  const reviews = await prisma.reviews.findFirst({
    where: {
      reviewId: +reviewId
    }
  })
  if (!reviews) {
    return res.status(404).json({ errorMessage: "존재하지 않는 리뷰입니다." })
  } else if (reviews.password !== password ){
return res.status(401).json({ errorMessage: "비밀번호가 일치하지 않습니다." })
  }
  await prisma.reviews.delete({
    where: {
      reviewId: +reviewId
    }
  })
  return res.status(200).json({ data: "게시글이 삭제되었습니다." })
} catch (error) {
  next(error)
}
})

export default router;
