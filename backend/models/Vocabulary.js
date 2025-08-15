const mongoose = require("mongoose");

const vocabularySchema = new mongoose.Schema({
  english: {
    type: String,
    required: true,
    trim: true,
  },
  vietnamese: {
    type: String,
    required: true,
    trim: true,
  },
  wordType: {
    type: String,
    enum: [
      "noun",
      "verb",
      "adjective",
      "adverb",
      "preposition",
      "conjunction",
      "interjection",
      "pronoun",
      "other",
    ],
    default: "other",
  },
  pronunciation: {
    type: String,
    trim: true,
  },
  lastReviewed: {
    type: Date,
    default: null,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  memorized: {
    type: Boolean,
    default: false,
  },
  studied: {
    type: Boolean,
    default: false,
  },
  lastStudied: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Vocabulary", vocabularySchema);
