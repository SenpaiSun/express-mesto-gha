const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const NotFoundError = require('./errors/NotFoundError');
const cardsRouter = require('./routes/cards');
const usersRouter = require('./routes/users');
const { login, createUser } = require('./controllers/users');
const auth = require('./middlewares/auth');

const app = express();
const { PORT = 3000 } = process.env;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
});
mongoose.connect('mongodb://localhost:27017/mestodb', { family: 4 });

app.use(limiter);
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/signin', login);
app.post('/signup', createUser);
app.use(auth);
app.use(cardsRouter);
app.use(usersRouter);
app.use('*', () => {
  throw new NotFoundError('Некорректный URL');
});
app.use((err, req, res) => {
  res.status(err.status).send({ message: err.message });
});
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Все гуд, порт ${PORT} заведен!`);
});
