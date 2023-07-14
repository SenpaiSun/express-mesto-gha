const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');
const InternalServerError = require('../errors/InternalServerError');
const Card = require('../models/card');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError(
            'Переданы некорректные данные при создании карточки',
          ),
        );
      }
      return next(new InternalServerError('Произошла ошибка на сервере'));
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Карточка с указанным _id не найдена'));
      }
      if (card.owner.toString() !== req.user._id.toString()) {
        return next(new ForbiddenError('Нельзя удалить чужую карточку!'));
      }
      return Card.findByIdAndRemove(req.params.cardId);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(
          new ValidationError(
            'Переданы некорректные данные для постановки/снятии лайка',
          ),
        );
      }
      return next(new InternalServerError('Произошла ошибка на сервере'));
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Передан несуществующий _id карточки'));
      }
      return res.send({ card });
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(
          new ValidationError(
            'Переданы некорректные данные для постановки/снятии лайка',
          ),
        );
      }
      return next(new InternalServerError('Произошла ошибка на сервере'));
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Передан несуществующий _id карточки'));
      }
      return res.send({ card });
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(
          new ValidationError(
            'Переданы некорректные данные для постановки/снятии лайка',
          ),
        );
      }
      return next(new InternalServerError('Произошла ошибка на сервере'));
    });
};
