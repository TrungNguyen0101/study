// Service để tự động dịch từ tiếng Anh sang tiếng Việt
const axios = require("axios");

class TranslationService {
  // Sử dụng Free Dictionary API để lấy definition và tự dịch
  static async getVietnameseTranslation(englishWord) {
    try {
      // Lấy definition từ Free Dictionary API
      //   const response = await axios.get(
      //     `https://api.dictionaryapi.dev/api/v2/entries/en/${englishWord.toLowerCase()}`
      //   );
      const res = await axios.get("https://api.mymemory.translated.net/get", {
        params: {
          q: englishWord.toLowerCase(),
          langpair: "en|vi",
        },
      });
      console.log(
        "🚀 ~ TranslationService ~ getVietnameseTranslation ~ res:",
        res.data.responseData.translatedText
      );

      //   return res.data.responseData.translatedText;

      //   console.log(res.data.translatedText);

      //   if (response.data && response.data.length > 0) {
      //     const entry = response.data[0];

      //     // Lấy definitions từ meanings
      //     const definitions = [];
      //     if (entry.meanings && entry.meanings.length > 0) {
      //       entry.meanings.forEach((meaning) => {
      //         if (meaning.definitions && meaning.definitions.length > 0) {
      //           // Lấy definition đầu tiên của mỗi part of speech
      //           const def = meaning.definitions[0];
      //           if (def.definition) {
      //             definitions.push({
      //               partOfSpeech: meaning.partOfSpeech,
      //               definition: def.definition,
      //               example: def.example || null,
      //             });
      //           }
      //         }
      //       });
      //     }

      //     if (definitions.length > 0) {
      //       // Tạo nghĩa tiếng Việt đơn giản dựa trên definition
      //       const vietnameseTranslation = this.generateVietnameseFromDefinition(
      //         englishWord,
      //         definitions[0]
      //       );

      //       return {
      //         vietnamese: vietnameseTranslation,
      //         definitions: definitions.slice(0, 3), // Lấy tối đa 3 definitions
      //         success: true,
      //       };
      //     }
      //   }

      //   // Fallback: sử dụng từ điển cơ bản
      // return this.getBasicTranslation(englishWord);
      return this.getBasicTranslation(res.data.responseData.translatedText);
    } catch (error) {
      console.log(
        "🚀 ~ TranslationService ~ getVietnameseTranslation ~ error:",
        error
      );
      console.log(
        `Could not fetch translation for "${englishWord}":`,
        error.message
      );
      return this.getBasicTranslation(englishWord);
    }
  }

  // Tạo nghĩa tiếng Việt từ definition tiếng Anh
  static generateVietnameseFromDefinition(word, meaningObj) {
    const { partOfSpeech, definition } = meaningObj;

    // Các từ khóa thường gặp trong definition và bản dịch tương ứng
    const translationMap = {
      // Common verbs
      "to make": "làm",
      "to create": "tạo ra",
      "to give": "đưa",
      "to take": "lấy",
      "to put": "đặt",
      "to get": "có được",
      "to have": "có",
      "to be": "là",
      "to do": "làm",
      "to say": "nói",
      "to see": "thấy",
      "to come": "đến",
      "to go": "đi",
      "to know": "biết",
      "to think": "nghĩ",
      "to look": "nhìn",
      "to use": "sử dụng",
      "to find": "tìm thấy",
      "to want": "muốn",
      "to tell": "kể",
      "to ask": "hỏi",
      "to work": "làm việc",
      "to feel": "cảm thấy",
      "to try": "thử",
      "to leave": "rời khỏi",
      "to call": "gọi",

      // Common nouns
      person: "người",
      people: "mọi người",
      thing: "thứ",
      place: "nơi",
      time: "thời gian",
      way: "cách",
      day: "ngày",
      man: "người đàn ông",
      woman: "người phụ nữ",
      child: "trẻ em",
      world: "thế giới",
      life: "cuộc sống",
      hand: "tay",
      part: "phần",
      eye: "mắt",
      woman: "phụ nữ",
      place: "địa điểm",
      work: "công việc",
      week: "tuần",
      case: "trường hợp",
      point: "điểm",
      government: "chính phủ",
      company: "công ty",

      // Common adjectives
      good: "tốt",
      new: "mới",
      first: "đầu tiên",
      last: "cuối cùng",
      long: "dài",
      great: "tuyệt vời",
      little: "nhỏ",
      own: "riêng",
      other: "khác",
      old: "cũ",
      right: "đúng",
      big: "lớn",
      high: "cao",
      different: "khác nhau",
      small: "nhỏ",
      large: "lớn",
      next: "tiếp theo",
      early: "sớm",
      young: "trẻ",
      important: "quan trọng",
      few: "ít",
      public: "công cộng",
      bad: "xấu",
      same: "giống",
      able: "có thể",

      // Common patterns
      "a person who": "người mà",
      "something that": "cái gì đó mà",
      "the state of": "trạng thái của",
      "the act of": "hành động",
      "the process of": "quá trình",
      "having the quality of": "có tính chất",
      "characterized by": "đặc trưng bởi",
      "relating to": "liên quan đến",
      "consisting of": "bao gồm",
      "in a way that": "theo cách mà",
    };

    let vietnamese = definition.toLowerCase();

    // Apply translation rules
    Object.keys(translationMap).forEach((englishPhrase) => {
      const regex = new RegExp(
        englishPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );
      vietnamese = vietnamese.replace(regex, translationMap[englishPhrase]);
    });

    // Simplify and clean up
    vietnamese = vietnamese
      .replace(/\b(a|an|the)\b/gi, "") // Remove articles
      .replace(/\s+/g, " ") // Clean multiple spaces
      .trim();

    // Capitalize first letter
    vietnamese = vietnamese.charAt(0).toUpperCase() + vietnamese.slice(1);

    // Add part of speech prefix if available
    const partOfSpeechMap = {
      noun: "(danh từ)",
      verb: "(động từ)",
      adjective: "(tính từ)",
      adverb: "(trạng từ)",
      preposition: "(giới từ)",
      conjunction: "(liên từ)",
      interjection: "(thán từ)",
      pronoun: "(đại từ)",
    };

    if (partOfSpeech && partOfSpeechMap[partOfSpeech]) {
      vietnamese = `${partOfSpeechMap[partOfSpeech]} ${vietnamese}`;
    }

    return vietnamese;
  }

  // Từ điển cơ bản cho các từ thường gặp
  static getBasicTranslation(word) {
    const basicDictionary = {
      // Most common English words with Vietnamese translations
      hello: "xin chào",
      goodbye: "tạm biệt",
      thank: "cảm ơn",
      please: "xin lỗi",
      sorry: "xin lỗi",
      yes: "có",
      no: "không",
      good: "tốt",
      bad: "xấu",
      big: "lớn",
      small: "nhỏ",
      hot: "nóng",
      cold: "lạnh",
      fast: "nhanh",
      slow: "chậm",
      happy: "vui",
      sad: "buồn",
      love: "yêu",
      hate: "ghét",
      eat: "ăn",
      drink: "uống",
      sleep: "ngủ",
      work: "làm việc",
      study: "học",
      play: "chơi",
      run: "chạy",
      walk: "đi bộ",
      read: "đọc",
      write: "viết",
      listen: "nghe",
      speak: "nói",
      see: "thấy",
      hear: "nghe",
      think: "nghĩ",
      know: "biết",
      understand: "hiểu",
      learn: "học",
      teach: "dạy",
      help: "giúp đỡ",
      come: "đến",
      go: "đi",
      stay: "ở lại",
      leave: "rời khỏi",
      find: "tìm thấy",
      lose: "mất",
      give: "đưa",
      take: "lấy",
      buy: "mua",
      sell: "bán",
      make: "làm",
      do: "làm",
      have: "có",
      be: "là",
      get: "có được",
      want: "muốn",
      need: "cần",
      like: "thích",
      house: "nhà",
      car: "xe hơi",
      book: "sách",
      phone: "điện thoại",
      computer: "máy tính",
      water: "nước",
      food: "thức ăn",
      money: "tiền",
      time: "thời gian",
      day: "ngày",
      night: "đêm",
      morning: "buổi sáng",
      afternoon: "buổi chiều",
      evening: "buổi tối",
      week: "tuần",
      month: "tháng",
      year: "năm",
      today: "hôm nay",
      yesterday: "hôm qua",
      tomorrow: "ngày mai",
      school: "trường học",
      hospital: "bệnh viện",
      store: "cửa hàng",
      restaurant: "nhà hàng",
      park: "công viên",
      city: "thành phố",
      country: "đất nước",
      world: "thế giới",
      family: "gia đình",
      friend: "bạn",
      mother: "mẹ",
      father: "bố",
      brother: "anh/em trai",
      sister: "chị/em gái",
      child: "trẻ em",
      man: "đàn ông",
      woman: "phụ nữ",
      person: "người",
      people: "mọi người",
    };

    const translation = basicDictionary[word.toLowerCase()];
    console.log(
      "🚀 ~ TranslationService ~ getBasicTranslation ~ translation:",
      translation
    );

    if (translation) {
      return {
        vietnamese: translation,
        definitions: [
          {
            partOfSpeech: "unknown",
            definition: `Common translation for "${word}"`,
            example: null,
          },
        ],
        success: true,
      };
    }

    return {
      vietnamese: word,
      definitions: [],
      success: true,
    };
  }
}

module.exports = TranslationService;
