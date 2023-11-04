
import express from 'express';
import CommentsRouter from './routes/comments.router.js';
import ReviewsRouter from './routes/reviews.router.js';
import errorHandlerMiddleware from '../middlewares/error-handler.middleware.js';

const app = express();
const PORT = 3030;

app.use(express.json());
app.use('/api', [CommentsRouter]);
app.use('/api', [ReviewsRouter]);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});