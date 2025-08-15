// Utility functions for Text-to-Speech functionality

// Hàm chờ voices load xong
const waitForVoices = () => {
  return new Promise((resolve) => {
    if (speechSynthesis.getVoices().length > 0) {
      resolve(speechSynthesis.getVoices());
    } else {
      speechSynthesis.addEventListener(
        "voiceschanged",
        () => {
          resolve(speechSynthesis.getVoices());
        },
        { once: true }
      );
    }
  });
};

// Hàm tìm giọng nam tiếng Anh
const findMaleEnglishVoice = (voices) => {
  // Danh sách tên giọng nam phổ biến
  const maleVoiceNames = [
    "david",
    "alex",
    "daniel",
    "mark",
    "tom",
    "john",
    "michael",
    "robert",
    "male",
    "man",
    "masculine",
  ];

  // Danh sách tên giọng nữ để loại trừ
  const femaleVoiceNames = [
    "female",
    "woman",
    "feminine",
    "samantha",
    "susan",
    "karen",
    "emily",
    "victoria",
    "allison",
    "ava",
    "zoe",
    "fiona",
    "tessa",
    "veena",
  ];

  // Tìm giọng nam tiếng Anh
  const maleVoice = voices.find((voice) => {
    const name = voice.name.toLowerCase();
    const isEnglish = voice.lang.startsWith("en");
    const isMale = maleVoiceNames.some((maleName) => name.includes(maleName));
    const isNotFemale = !femaleVoiceNames.some((femaleName) =>
      name.includes(femaleName)
    );

    return isEnglish && (isMale || isNotFemale);
  });

  // Fallback: bất kỳ giọng tiếng Anh nào
  if (!maleVoice) {
    return voices.find((voice) => voice.lang.startsWith("en"));
  }

  return maleVoice;
};

// Hàm phát âm chính
export const speakEnglishWord = async (text, options = {}) => {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported");
    return;
  }

  try {
    // Chờ voices load xong
    const voices = await waitForVoices();

    // Tạo utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || "en-US";
    utterance.rate = options.rate || 0.8;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Tìm và set giọng nam
    const preferredVoice = findMaleEnglishVoice(voices);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log(`Using voice: ${preferredVoice.name}`);
    }

    // Phát âm
    speechSynthesis.speak(utterance);

    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error("Speech synthesis error:", error);
  }
};

// Hàm debug để xem tất cả voices có sẵn
export const debugVoices = async () => {
  if (!("speechSynthesis" in window)) return [];

  const voices = await waitForVoices();
  console.log("Available voices:");
  voices.forEach((voice, index) => {
    console.log(
      `${index}: ${voice.name} (${voice.lang}) - ${
        voice.gender || "unknown gender"
      }`
    );
  });
  return voices;
};

export default speakEnglishWord;
