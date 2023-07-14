const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    validate: {
      validator: (value) => value.length >= 2 && value.length <= 30,
      message: 'Имя пользователя должно быть от 2 до 30 символов!',
    },
  },
  about: {
    type: String,
    default: 'Исследователь',
    validate: {
      validator: (value) => value.length >= 2 && value.length <= 30,
      message: 'Информация о пользователе должна быть от 2 до 30 символов!',
    },
  },
  avatar: {
    type: String,
    required: false,
    default:
      'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (avatar) => /^(http|https):\/\/(www\.)?[\w\-._~:/?#]+#?$/.test(avatar),
      message: 'Введите URL!',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: 'Требуется ввести электронный адрес',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

module.exports = mongoose.model('user', userSchema);
