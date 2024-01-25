const mongoose = require('mongoose');
const validator = require('validator');

const optionSchema = new mongoose.Schema({
  text: {
    type: String
  },
  image: {
    type: String,
    validate: [validator.isURL, 'Enter a valid URL']
  }
});

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: function(options) {
        return options.length > 1 && options.length <= 4;
      },
      message: 'Minimum two option required. Max is four.'
    },
    required: true
  },
  answer: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value < this.options.length;
      },
      message: 'Answer index is out of range'
    }
  },
  attempts: {
    type: Number,
    default: 0
  },
  corrects: {
    type: Number,
    default: 0
  }
});

const quizSchema = new mongoose.Schema({
  category: {
    type: String,
    default: 'quiz'
  },
  name: {
    type: String,
    required: true
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: function(value) {
        return value.length > 0 && value.length <= 5;
      },
      message: 'Minimum one question required. Max is five'
    },
    required: true
  },
  timer: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  impressions: {
    type: Number,
    default: 0
  },
  createdBy: mongoose.ObjectId
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
