const express = require("express");
const router = express.Router();
const Vocabulary = require("../models/Vocabulary");
const PronunciationService = require("../services/pronunciationService");
const TranslationService = require("../services/translationService");
const auth = require("../middleware/auth");

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
router.post("/add", auth, async (req, res) => {
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
      user: req.user._id,
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
router.get("/all", auth, async (req, res) => {
  try {
    const { search, wordType, memorized, page = 1, limit = 20 } = req.query;
    let query = { user: req.user._id };

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

// Lấy từ vựng để ôn tập (ưu tiên theo thời gian học và ôn tập, loại trừ từ đã nhớ)
router.get("/review", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Lấy tất cả từ vựng theo độ ưu tiên
    const allVocabularies = await Vocabulary.find({
      user: req.user._id,
      memorized: false,
    }).sort({
      studied: 1, // false trước (chưa học)
      lastStudied: 1, // null và date cũ trước (học lâu nhất)
      lastReviewed: 1, // null và date cũ trước (ôn lâu nhất)
      createdAt: -1, // từ mới tạo trước
    });

    // Chia thành nhóm và random trong từng nhóm
    const unstudiedWords = allVocabularies.filter((v) => !v.studied);
    const studiedWords = allVocabularies.filter((v) => v.studied);

    // Random trong từng nhóm theo thứ tự ưu tiên
    let prioritizedVocabularies = [];

    // Thêm từ chưa học (random)
    const shuffledUnstudied = unstudiedWords.sort(() => 0.5 - Math.random());
    prioritizedVocabularies.push(...shuffledUnstudied);

    // Thêm từ đã học (random)
    const shuffledStudied = studiedWords.sort(() => 0.5 - Math.random());
    prioritizedVocabularies.push(...shuffledStudied);

    // Apply pagination sau khi đã random đúng cách
    const vocabularies = prioritizedVocabularies.slice(skip, skip + limit);
    const shuffledVocabularies = vocabularies;

    const total = await Vocabulary.countDocuments({
      user: req.user._id,
      memorized: false,
    });
    const totalPages = Math.ceil(total / limit);

    res.json({
      vocabularies: shuffledVocabularies, // ✅ Trả về danh sách đã xáo trộn
      pagination: {
        current: page,
        total: totalPages,
        count: shuffledVocabularies.length,
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
router.put("/review/:id", auth, async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
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
router.put("/memorized/:id", auth, async (req, res) => {
  try {
    const { memorized } = req.body;

    const vocabulary = await Vocabulary.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
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
router.put("/studied/:id", auth, async (req, res) => {
  try {
    const { studied } = req.body;

    // Nếu đánh dấu là đã học, cập nhật thời gian
    const updateData = { studied: studied };
    if (studied) {
      updateData.lastStudied = new Date();
    } else {
      updateData.lastStudied = null;
    }

    const vocabulary = await Vocabulary.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
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
router.put("/:id", auth, async (req, res) => {
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
    const existingVocab = await Vocabulary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (
      !finalPronunciation ||
      (existingVocab && existingVocab.english !== english.toLowerCase().trim())
    ) {
      finalPronunciation = await PronunciationService.getPronunciation(english);
    }

    const vocabulary = await Vocabulary.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
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

// Lấy câu hỏi multiple choice
router.get("/multiple-choice", auth, async (req, res) => {
  try {
    // Lấy tất cả từ vựng chưa nhớ theo thứ tự ưu tiên
    const allVocabularies = await Vocabulary.find({
      user: req.user._id,
      memorized: false,
    }).sort({
      studied: 1, // false trước (chưa học)
      lastStudied: 1, // null và date cũ trước (học lâu nhất)
      lastReviewed: 1, // null và date cũ trước (ôn lâu nhất)
      createdAt: -1, // từ mới tạo trước
    });

    if (allVocabularies.length === 0) {
      return res
        .status(404)
        .json({ error: "No vocabularies available for quiz" });
    }

    // Chia thành các nhóm theo độ ưu tiên
    const unstudiedWords = allVocabularies.filter((v) => !v.studied);
    const studiedWords = allVocabularies.filter((v) => v.studied);

    let correctVocab;

    // Ưu tiên chọn từ chưa học, random trong top 10 của nhóm đó
    if (unstudiedWords.length > 0) {
      const topUnstudied = unstudiedWords.slice(
        0,
        Math.min(15, unstudiedWords.length)
      );
      const randomIndex = Math.floor(Math.random() * topUnstudied.length);
      correctVocab = topUnstudied[randomIndex];
    } else if (studiedWords.length > 0) {
      // Nếu không có từ chưa học, random trong top 10 từ đã học
      const topStudied = studiedWords.slice(
        0,
        Math.min(15, studiedWords.length)
      );
      const randomIndex = Math.floor(Math.random() * topStudied.length);
      correctVocab = topStudied[randomIndex];
    } else {
      correctVocab = allVocabularies[0]; // Fallback
    }

    // Lấy 50 từ đầu để tạo đáp án sai
    const vocabularies = allVocabularies.slice(0, 50);

    // Lấy các từ khác (không trùng từ đúng)
    const otherVocabs = vocabularies.filter(
      (v) => v._id.toString() !== correctVocab._id.toString()
    );

    const wrongAnswers = [];

    if (otherVocabs.length < 3) {
      // Nếu chưa đủ 3 đáp án sai, lấy thêm từ khác (kể cả đã memorized)
      const additionalVocabs = await Vocabulary.find({
        user: req.user._id,
        _id: { $nin: vocabularies.map((v) => v._id) },
      }).limit(3 - otherVocabs.length);

      wrongAnswers.push(...otherVocabs.map((v) => v.vietnamese));
      wrongAnswers.push(...additionalVocabs.map((v) => v.vietnamese));
    } else {
      // Lấy ngẫu nhiên 3 từ làm đáp án sai
      const shuffled = otherVocabs.sort(() => 0.5 - Math.random());
      wrongAnswers.push(...shuffled.slice(0, 3).map((v) => v.vietnamese));
    }

    while (wrongAnswers.length < 3) {
      wrongAnswers.push("Đáp án tạm thời");
    }

    const allAnswers = [correctVocab.vietnamese, ...wrongAnswers.slice(0, 3)];
    const shuffledAnswers = allAnswers.sort(() => 0.5 - Math.random());
    const correctAnswerIndex = shuffledAnswers.indexOf(correctVocab.vietnamese);

    res.json({
      vocabularyId: correctVocab._id,
      english: correctVocab.english,
      pronunciation: correctVocab.pronunciation,
      wordType: correctVocab.wordType,
      answers: shuffledAnswers,
      correctAnswerIndex: correctAnswerIndex,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy danh sách câu hỏi multiple choice một lần (không cần gọi lại sau mỗi lần chọn)
router.get("/multiple-choice/list", auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // số câu hỏi muốn lấy

    // Lấy tất cả từ vựng chưa nhớ theo thứ tự ưu tiên
    const allVocabularies = await Vocabulary.find({
      user: req.user._id,
      memorized: false,
    }).sort({
      studied: 1,
      lastStudied: 1,
      lastReviewed: 1,
      createdAt: -1,
    });

    if (allVocabularies.length === 0) {
      return res
        .status(404)
        .json({ error: "No vocabularies available for quiz" });
    }

    // Chia nhóm ưu tiên và random trong nhóm
    const unstudiedWords = allVocabularies.filter((v) => !v.studied);
    const studiedWords = allVocabularies.filter((v) => v.studied);

    const shuffledUnstudied = unstudiedWords.sort(() => 0.5 - Math.random());
    const shuffledStudied = studiedWords.sort(() => 0.5 - Math.random());

    // Danh sách ưu tiên (chưa học trước, rồi đã học)
    const prioritized = [...shuffledUnstudied, ...shuffledStudied];

    // Cắt theo limit để tạo danh sách câu hỏi
    const selectedForQuestions = prioritized.slice(0, limit);

    // Pool để chọn đáp án sai (lấy nhiều hơn để đa dạng)
    const distractorPool = allVocabularies.slice(
      0,
      Math.min(100, allVocabularies.length)
    );

    const questions = [];

    for (const correctVocab of selectedForQuestions) {
      // Lọc các từ khác để làm đáp án sai
      const otherVocabs = distractorPool.filter(
        (v) => v._id.toString() !== correctVocab._id.toString()
      );

      let wrongAnswers = [];
      if (otherVocabs.length >= 3) {
        const shuffled = otherVocabs.sort(() => 0.5 - Math.random());
        wrongAnswers = shuffled
          .slice(0, 3)
          .map((v) => v.vietnamese)
          .filter((ans) => ans && ans !== correctVocab.vietnamese);
      } else {
        wrongAnswers.push(...otherVocabs.map((v) => v.vietnamese));
      }

      // Bổ sung nếu thiếu đáp án sai
      while (wrongAnswers.length < 3) {
        const candidate = "Đáp án tạm thời";
        wrongAnswers.push(candidate);
      }

      const allAnswers = [correctVocab.vietnamese, ...wrongAnswers.slice(0, 3)];
      const shuffledAnswers = allAnswers.sort(() => 0.5 - Math.random());
      const correctAnswerIndex = shuffledAnswers.indexOf(
        correctVocab.vietnamese
      );

      questions.push({
        vocabularyId: correctVocab._id,
        english: correctVocab.english,
        pronunciation: correctVocab.pronunciation,
        wordType: correctVocab.wordType,
        answers: shuffledAnswers,
        correctAnswerIndex,
      });
    }

    res.json({
      count: questions.length,
      questions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy câu hỏi điền từ
router.get("/fill-blank", auth, async (req, res) => {
  try {
    // Lấy tất cả từ vựng chưa nhớ theo thứ tự ưu tiên
    const allVocabularies = await Vocabulary.find({
      user: req.user._id,
      memorized: false,
    }).sort({
      studied: 1, // false trước (chưa học)
      lastStudied: 1, // null và date cũ trước (học lâu nhất)
      lastReviewed: 1, // null và date cũ trước (ôn lâu nhất)
      createdAt: -1, // từ mới tạo trước
    });

    if (allVocabularies.length === 0) {
      return res
        .status(404)
        .json({ error: "No vocabularies available for quiz" });
    }

    // Chia thành các nhóm theo độ ưu tiên
    const unstudiedWords = allVocabularies.filter((v) => !v.studied);
    const studiedWords = allVocabularies.filter((v) => v.studied);

    let correctVocab;

    // Ưu tiên chọn từ chưa học, random trong top 15 của nhóm đó
    if (unstudiedWords.length > 0) {
      const topUnstudied = unstudiedWords.slice(
        0,
        Math.min(15, unstudiedWords.length)
      );
      const randomIndex = Math.floor(Math.random() * topUnstudied.length);
      correctVocab = topUnstudied[randomIndex];
    } else if (studiedWords.length > 0) {
      // Nếu không có từ chưa học, random trong top 15 từ đã học
      const topStudied = studiedWords.slice(
        0,
        Math.min(15, studiedWords.length)
      );
      const randomIndex = Math.floor(Math.random() * topStudied.length);
      correctVocab = topStudied[randomIndex];
    } else {
      correctVocab = allVocabularies[0]; // Fallback
    }

    res.json({
      vocabularyId: correctVocab._id,
      vietnamese: correctVocab.vietnamese,
      english: correctVocab.english,
      pronunciation: correctVocab.pronunciation,
      wordType: correctVocab.wordType,
      hint:
        correctVocab.english.charAt(0).toUpperCase() +
        correctVocab.english.charAt(1), // Gợi ý 2 chữ cái đầu
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy một từ vựng theo ID
router.get("/:id", auth, async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!vocabulary) {
      return res.status(404).json({ error: "Vocabulary not found" });
    }
    res.json(vocabulary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Xóa từ vựng
router.delete("/:id", auth, async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!vocabulary) {
      return res.status(404).json({ error: "Vocabulary not found" });
    }
    res.json({ message: "Vocabulary deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API migration - Cập nhật tất cả vocabulary cũ cho user hiện tại
router.post("/migrate-to-user", auth, async (req, res) => {
  try {
    // Tìm tất cả vocabulary không có user hoặc user = null
    const orphanVocabularies = await Vocabulary.find({
      $or: [{ user: { $exists: false } }, { user: null }],
    });

    if (orphanVocabularies.length === 0) {
      return res.json({
        success: true,
        message: "Không có vocabulary nào cần migration",
        migrated: 0,
      });
    }

    // Cập nhật tất cả vocabulary này cho user hiện tại
    const result = await Vocabulary.updateMany(
      {
        $or: [{ user: { $exists: false } }, { user: null }],
      },
      {
        $set: { user: req.user._id },
      }
    );

    res.json({
      success: true,
      message: `Đã migration thành công ${result.modifiedCount} vocabulary cho user ${req.user.username}`,
      migrated: result.modifiedCount,
      found: orphanVocabularies.length,
    });
  } catch (error) {
    console.error("Migration error:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi migration vocabulary: " + error.message,
    });
  }
});

module.exports = router;
