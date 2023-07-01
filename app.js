const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cardsRouter = require('./routes/cards');
const usersRouter = require('./routes/users');

const app = express();
const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mestodb', { family: 4 });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.user = {
    _id: '649d1450fa26638f7e81c351',
  };

  next();
});
app.use(cardsRouter);
app.use(usersRouter);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Все гуд, порт ${PORT} заведен!`);
});
