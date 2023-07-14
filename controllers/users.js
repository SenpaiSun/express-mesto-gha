const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ConflictError = require('../errors/ConflictError');
const InternalServerError = require('../errors/InternalServerError');
const NotFoundError = require('../errors/NotFoundError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ValidationError = require('../errors/ValidationError');
const User = require('../models/user');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      const { _id } = user;
      return res.status(201).send({
        email,
        name,
        about,
        avatar,
        _id,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError(
            'Переданы некорректные данные при создании пользователя',
          ),
        );
      }
      if (err.code === 11000) {
        return next(new ConflictError('Такой Email уже зарегистрирован!'));
      }
      return next(new InternalServerError('Произошла ошибка на сервере'));
    });
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return next(
          new NotFoundError('Пользователь по указанному _id не найден'),
        );
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(
          new ValidationError('Переданы некорректные данные для пользователя'),
        );
      }
      return next(new InternalServerError('Произошла ошибка на сервере'));
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true, context: 'query' },
  )
    .then((user) => {
      if (!user) {
        return next(
          new NotFoundError('Пользователь по указанному _id не найден'),
        );
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError(
            'Переданы некорректные данные при обновлении профиля',
          ),
        );
      }
      return next(new InternalServerError('Произошла ошибка на сервере.'));
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true, context: 'query' },
  )
    .then((user) => {
      if (!user) {
        return next(
          new NotFoundError('Пользователь по указанному _id не найден'),
        );
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError(
            'Переданы некорректные данные при обновлении аватара',
          ),
        );
      }
      return next(new InternalServerError('Произошла ошибка на сервере.'));
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let userInfo;
  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return next(new ValidationError('Неправильная почта или пароль'));
      }
      userInfo = user;
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        return next(new UnauthorizedError('Неправильная почта или пароль'));
      }
      const token = jwt.sign(
        { _id: userInfo._id },
        'b8af2639f08ce36611cec2bc3ffa691e13af25ab6a3cc51198f3671280b4a881',
        { expiresIn: '7d' },
      );
      return res.send({ token });
    })
    .catch(() => next(new UnauthorizedError('Неправильная почта или пароль')));
};

module.exports.getInfoUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        return next(
          new NotFoundError('Пользователь по указанному _id не найден'),
        );
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(
          new ValidationError('Переданы некорректные данные для пользователя'),
        );
      }
      return next(new InternalServerError('Произошла ошибка на сервере.'));
    });
};
