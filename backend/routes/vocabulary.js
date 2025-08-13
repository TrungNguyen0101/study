const express = require("express");
const router = express.Router();
const Vocabulary = require("../models/Vocabulary");
const PronunciationService = require("../services/pronunciationService");
const TranslationService = require("../services/translationService");

// Lấy thông tin từ vựng tự động (phiên âm và loại từ)
router.get("/word-info/:word", async (req, res) => {
  try {
    const word = req.params.word;
    const wordInfo = await PronunciationService.getWordInfo(word);
    res.json(wordInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy bản dịch tiếng Việt tự động
router.get("/translate/:word", async (req, res) => {
  try {
    const word = req.params.word;
    const translation = await TranslationService.getVietnameseTranslation(word);
    res.json(translation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Thêm từ vựng mới
router.post("/add", async (req, res) => {
  try {
    const { english, vietnamese, wordType, pronunciation } = req.body;

    if (!english || !vietnamese) {
      return res
        .status(400)
        .json({ error: "English and Vietnamese are required" });
    }

    // Tự động tạo phiên âm nếu không có
    let finalPronunciation = pronunciation;
    if (!finalPronunciation) {
      finalPronunciation = await PronunciationService.getPronunciation(english);
    }

    const vocabulary = new Vocabulary({
      english: english.toLowerCase().trim(),
      vietnamese: vietnamese.trim(),
      wordType: wordType || "other",
      pronunciation: finalPronunciation,
    });

    await vocabulary.save();
    res
      .status(201)
      .json({ message: "Vocabulary added successfully", vocabulary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy tất cả từ vựng với tìm kiếm
router.get("/all", async (req, res) => {
  try {
    const { search, wordType, memorized, page = 1, limit = 20 } = req.query;
    let query = {};

    // Tìm kiếm theo từ tiếng Anh hoặc nghĩa tiếng Việt
    if (search) {
      query.$or = [
        { english: { $regex: search, $options: "i" } },
        { vietnamese: { $regex: search, $options: "i" } },
      ];
    }

    // Lọc theo loại từ
    if (wordType && wordType !== "all") {
      query.wordType = wordType;
    }

    // Lọc theo trạng thái memorized
    if (memorized !== undefined && memorized !== "all") {
      query.memorized = memorized === "true";
    }

    const skip = (page - 1) * limit;
    const vocabularies = await Vocabulary.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Vocabulary.countDocuments(query);

    res.json({
      vocabularies,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: vocabularies.length,
        totalItems: total,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy từ vựng để ôn tập (ưu tiên chưa được ôn hoặc ôn lâu nhất, loại trừ từ đã nhớ)
router.get("/review", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8; // Mặc định lấy 8 từ cho game 4x4
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Lấy từ vựng chưa memorized theo độ ưu tiên: chưa studied -> chưa ôn -> ôn lâu nhất
    const vocabularies = await Vocabulary.find({ memorized: false })
      .sort({
        studied: 1, // false sẽ đứng đầu (chưa học)
        lastReviewed: 1, // null sẽ đứng đầu (chưa ôn)
        createdAt: -1, // từ mới tạo trước
      })
      .skip(skip)
      .limit(limit);

    // Đếm tổng số từ vựng chưa memorized
    const total = await Vocabulary.countDocuments({ memorized: false });
    const totalPages = Math.ceil(total / limit);

    res.json({
      vocabularies,
      pagination: {
        current: page,
        total: totalPages,
        count: vocabularies.length,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật trạng thái ôn tập
router.put("/review/:id", async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findByIdAndUpdate(
      req.params.id,
      {
        lastReviewed: new Date(),
        $inc: { reviewCount: 1 },
      },
      { new: true }
    );

    if (!vocabulary) {
      return res.status(404).json({ error: "Vocabulary not found" });
    }

    res.json({ message: "Review updated", vocabulary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật trạng thái memorized
router.put("/memorized/:id", async (req, res) => {
  try {
    const { memorized } = req.body;

    const vocabulary = await Vocabulary.findByIdAndUpdate(
      req.params.id,
      { memorized: memorized },
      { new: true }
    );

    if (!vocabulary) {
      return res.status(404).json({ error: "Vocabulary not found" });
    }

    res.json({
      message: `Vocabulary marked as ${
        memorized ? "memorized" : "not memorized"
      }`,
      vocabulary,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật trạng thái studied
router.put("/studied/:id", async (req, res) => {
  try {
    const { studied } = req.body;

    const vocabulary = await Vocabulary.findByIdAndUpdate(
      req.params.id,
      { studied: studied },
      { new: true }
    );

    if (!vocabulary) {
      return res.status(404).json({ error: "Vocabulary not found" });
    }

    res.json({
      message: `Vocabulary marked as ${studied ? "studied" : "not studied"}`,
      vocabulary,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cập nhật từ vựng
router.put("/:id", async (req, res) => {
  try {
    const { english, vietnamese, wordType, pronunciation, memorized } =
      req.body;

    if (!english || !vietnamese) {
      return res
        .status(400)
        .json({ error: "English and Vietnamese are required" });
    }

    // Tự động tạo phiên âm nếu từ tiếng Anh thay đổi và không có phiên âm mới
    let finalPronunciation = pronunciation;
    const existingVocab = await Vocabulary.findById(req.params.id);

    if (
      !finalPronunciation ||
      (existingVocab && existingVocab.english !== english.toLowerCase().trim())
    ) {
      finalPronunciation = await PronunciationService.getPronunciation(english);
    }

    const vocabulary = await Vocabulary.findByIdAndUpdate(
      req.params.id,
      {
        english: english.toLowerCase().trim(),
        vietnamese: vietnamese.trim(),
        wordType: wordType || "other",
        pronunciation: finalPronunciation,
        memorized: memorized || false,
      },
      { new: true }
    );

    if (!vocabulary) {
      return res.status(404).json({ error: "Vocabulary not found" });
    }

    res.json({ message: "Vocabulary updated successfully", vocabulary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy một từ vựng theo ID
router.get("/:id", async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    if (!vocabulary) {
      return res.status(404).json({ error: "Vocabulary not found" });
    }
    res.json(vocabulary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa từ vựng
router.delete("/:id", async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findByIdAndDelete(req.params.id);
    if (!vocabulary) {
      return res.status(404).json({ error: "Vocabulary not found" });
    }
    res.json({ message: "Vocabulary deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
