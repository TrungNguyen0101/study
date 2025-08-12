// Service để tự động tạo phiên âm từ tiếng Anh
// Sử dụng API miễn phí hoặc thư viện để tạo phiên âm

const axios = require("axios");

class PronunciationService {
  // Sử dụng API miễn phí từ Free Dictionary API
  static async getPronunciation(word) {
    try {
      const response = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
      );

      if (response.data && response.data.length > 0) {
        const entry = response.data[0];

        // Tìm phiên âm US trước, sau đó UK
        if (entry.phonetics && entry.phonetics.length > 0) {
          // Ưu tiên phiên âm US
          const usPhonetic = entry.phonetics.find(
            (p) =>
              p.text &&
              (p.text.includes("/") || p.text.includes("[")) &&
              (!p.audio || p.audio.includes("-us") || p.audio.includes("_us"))
          );

          if (usPhonetic && usPhonetic.text) {
            return this.cleanPronunciation(usPhonetic.text);
          }

          // Fallback: lấy phiên âm đầu tiên có text
          for (const phonetic of entry.phonetics) {
            if (phonetic.text) {
              return this.cleanPronunciation(phonetic.text);
            }
          }
        }

        // Fallback: tạo phiên âm đơn giản dựa trên từ
        return this.generateAdvancedPronunciation(word);
      }

      return this.generateAdvancedPronunciation(word);
    } catch (error) {
      console.log(
        `Could not fetch pronunciation for "${word}":`,
        error.message
      );
      return this.generateAdvancedPronunciation(word);
    }
  }

  // Làm sạch phiên âm
  static cleanPronunciation(pronunciation) {
    // Loại bỏ ký tự không cần thiết và format lại
    let cleaned = pronunciation.trim();

    // Đảm bảo có dấu / ở đầu và cuối
    if (!cleaned.startsWith("/") && !cleaned.startsWith("[")) {
      cleaned = `/${cleaned}`;
    }
    if (!cleaned.endsWith("/") && !cleaned.endsWith("]")) {
      cleaned = `${cleaned}/`;
    }

    // Convert [] thành //
    cleaned = cleaned.replace(/\[/g, "/").replace(/\]/g, "/");

    return cleaned;
  }

  // Tạo phiên âm nâng cao hơn khi không có API
  static generateAdvancedPronunciation(word) {
    // Quy tắc nâng cao hơn cho phiên âm US
    const pronunciationRules = {
      // Consonant clusters
      th: "θ", // thin
      TH: "ð", // the (voiced)
      sh: "ʃ", // ship
      ch: "tʃ", // chair
      ph: "f", // phone
      gh: "", // laugh (silent)
      ck: "k", // back
      ng: "ŋ", // sing

      // Vowel patterns
      ee: "iː", // see
      ea: "iː", // sea
      oo: "uː", // food
      ou: "aʊ", // house
      ow: "aʊ", // cow
      oy: "ɔɪ", // boy
      oi: "ɔɪ", // coin
      ay: "eɪ", // day
      ai: "eɪ", // rain
      ie: "aɪ", // pie
      igh: "aɪ", // light

      // Common endings
      tion: "ʃən", // nation
      sion: "ʒən", // vision
      ture: "tʃər", // nature
      sure: "ʃər", // pleasure
      ous: "əs", // famous
      ful: "fəl", // beautiful
      ing: "ɪŋ", // running
      ed: "d", // walked
      er: "ər", // teacher
      ly: "li", // quickly

      // Single vowels (context dependent - simplified)
      a: "æ", // cat
      e: "e", // pen
      i: "ɪ", // sit
      o: "ɑ", // hot
      u: "ʌ", // cup
      y: "ɪ", // gym
    };

    let pronunciation = word.toLowerCase();

    // Apply rules in order of length (longer patterns first)
    const sortedRules = Object.keys(pronunciationRules).sort(
      (a, b) => b.length - a.length
    );

    sortedRules.forEach((pattern) => {
      const regex = new RegExp(pattern, "gi");
      pronunciation = pronunciation.replace(regex, pronunciationRules[pattern]);
    });

    // Clean up and format
    pronunciation = pronunciation.replace(
      /[^a-zA-Zɪɛæɑɔʊuiɯəɚɝɞɜɘɤʌøɵɐɶæĩẽɑ̃õũœ̃θðʃʒtʃdʒŋmnɳɲɴpbtdʈɖckgqɢʔhɦfiβvszɹɻjɥɰlɭʎrɾɽʀχɣħʕʜʢʘɨɳː]/g,
      ""
    );

    return `/${pronunciation}/`;
  }

  // Keep old method for backward compatibility
  static generateSimplePronunciation(word) {
    return this.generateAdvancedPronunciation(word);
  }

  // Lấy thông tin chi tiết từ từ điển
  static async getWordInfo(word) {
    try {
      const response = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
      );

      if (response.data && response.data.length > 0) {
        const entry = response.data[0];

        // Lấy phiên âm
        let pronunciation = "";
        if (entry.phonetics && entry.phonetics.length > 0) {
          for (const phonetic of entry.phonetics) {
            if (phonetic.text) {
              pronunciation = phonetic.text;
              break;
            }
          }
        }

        return {
          pronunciation:
            pronunciation || this.generateAdvancedPronunciation(word),
          definitions: entry.meanings?.[0]?.definitions?.slice(0, 2) || [],
        };
      }

      return {
        pronunciation: this.generateAdvancedPronunciation(word),
        definitions: [],
      };
    } catch (error) {
      console.log(`Could not fetch word info for "${word}":`, error.message);
      return {
        pronunciation: this.generateAdvancedPronunciation(word),
        definitions: [],
      };
    }
  }

  // Map từ part of speech sang enum của chúng ta
  static mapPartOfSpeech(partOfSpeech) {
    const mapping = {
      noun: "noun",
      verb: "verb",
      adjective: "adjective",
      adverb: "adverb",
      preposition: "preposition",
      conjunction: "conjunction",
      interjection: "interjection",
      pronoun: "pronoun",
    };

    return mapping[partOfSpeech.toLowerCase()] || "other";
  }
}

module.exports = PronunciationService;
