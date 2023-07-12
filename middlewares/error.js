module.exports = (err, req, res, next) => {
  const { status = 500, message = 'Ошибка на сервере' } = err;
  res.status(status).send({ message });
  next();
};
