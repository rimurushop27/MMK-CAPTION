// MMK-CAPTION - Netlify Function
// Vision caption generator for short flirty IG/FB fanpage captions.

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const LANG_PROFILES = {
  ID: {
    label: "Bahasa Indonesia",
    locale: "Indonesia",
    targetAudience: "cowok Indonesia dewasa di Facebook/Instagram",
    style: "bahasa Indonesia Gen-Z yang hidup, centil tipis, gabut, manja, sedikit menggoda, singkat, tidak kaku, tidak default AI, terasa seperti caption cewek asli di IG/FB",
    examples: [
      "lihat boleh, salting jangan 🤭✨",
      "gabut dikit, bikin kamu mikir banyak 🫠💋",
      "mas, jangan cuma jadi penonton 😌🫶🏻",
      "aku upload santai, kamu yang kepikiran kan? 😳✨",
      "yang diem-diem suka, sini muncul dulu 🤭🖤"
    ],
    hashtagHints: {
      ig: "#fyp #explorepage #viral #cantik #cewekindo #selfie #reelsindonesia",
      fb: "#fbviral #fypfb #viralindonesia #captionfb #fotocantik #cewekindo"
    }
  },
  EN: {
    label: "English",
    locale: "global English audience",
    targetAudience: "adult men on Facebook/Instagram",
    style: "short Gen-Z English captions, soft-flirty, playful, aesthetic, casual IG/FB style, not formal, not poetic, not robotic, not default AI",
    examples: [
      "look once, think twice 🤭✨",
      "soft post, loud thoughts 🫠💋",
      "don’t just stare, say something 😌🫶🏻",
      "posted this casually, ruined your focus maybe 😳✨",
      "quiet likes are cute, comments are better 🤭🖤"
    ],
    hashtagHints: {
      ig: "#explorepage #fyp #viral #instagood #selfie #reels #prettygirl",
      fb: "#facebookviral #fbpost #viralpost #trendingnow #photopost #prettygirl"
    }
  },
  MY: {
    label: "Bahasa Melayu Malaysia",
    locale: "Malaysia",
    targetAudience: "lelaki Malaysia dewasa di Facebook/Instagram",
    style: "Bahasa Melayu Malaysia santai, Gen-Z, ayat pendek, manja, cute, mengusik ringan, bukan Bahasa Indonesia, bukan ayat formal, bukan hasil translate",
    examples: [
      "tengok boleh, tersuka jangan 🤭✨",
      "upload sikit, awak pula fikir banyak 🫠💋",
      "kalau nampak, jangan diam sangat 😌🫶🏻",
      "saja lalu feed, kot ada yang rindu 😳✨",
      "yang stalk diam-diam tu, hai 🤭🖤"
    ],
    hashtagHints: {
      ig: "#fypmalaysia #explorepage #viralmalaysia #malaysiagirl #selfiemalaysia #ootdmalaysia",
      fb: "#fbviralmalaysia #facebookmalaysia #viralmalaysia #captionfb #fotomalaysia #malaysiagirl"
    }
  },
  TH: {
    label: "ภาษาไทย",
    locale: "Thailand",
    targetAudience: "ผู้ชายไทยวัยผู้ใหญ่บน Facebook/Instagram",
    style: "ภาษาไทยโซเชียล Gen-Z สั้น ๆ น่ารัก ขี้เล่น อ่อยเบา ๆ สุภาพ เป็นธรรมชาติ ไม่เป็นทางการ ไม่เหมือนแปลตรงตัว ไม่แข็งแบบ AI",
    examples: [
      "มองได้ แต่อย่าเผลอใจนะ 🤭✨",
      "ลงเล่น ๆ แต่มีคนคิดจริงไหม 🫠💋",
      "เห็นแล้วก็อย่าเงียบสิ 😌🫶🏻",
      "วันนี้น่ารักพอให้ทักยัง 😳✨",
      "คนที่แอบมองอยู่ ทักมาได้นะ 🤭🖤"
    ],
    hashtagHints: {
      ig: "#ฟีด #ติดเทรนด์ #ไวรัล #สาวน่ารัก #สาวไทย #ไอจีไทย #เซลฟี่",
      fb: "#เฟซบุ๊กไวรัล #โพสต์เฟซบุ๊ก #ไวรัลไทย #แคปชั่นเฟซบุ๊ก #สาวน่ารัก"
    }
  },
  VI: {
    label: "Tiếng Việt",
    locale: "Vietnam",
    targetAudience: "nam giới trưởng thành ở Facebook/Instagram Việt Nam",
    style: "tiếng Việt mạng xã hội Gen-Z ngắn, thả thính nhẹ, cute, tự nhiên, không trang trọng, không dịch máy, không cứng như AI",
    examples: [
      "nhìn thôi, đừng rung động nha 🤭✨",
      "đăng nhẹ mà ai đó nghĩ nhiều 🫠💋",
      "thấy rồi thì đừng im lặng 😌🫶🏻",
      "hôm nay đủ xinh để anh nhắn chưa 😳✨",
      "ai lặng lẽ xem thì hiện hình đi 🤭🖤"
    ],
    hashtagHints: {
      ig: "#xuhuong #viral #fyp #gaixinh #vietnam #selfie #instavietnam",
      fb: "#facebookviral #xuhuongfacebook #viralvietnam #captionfacebook #gaixinh #anhdep"
    }
  }
};

function buildPrompt(lang) {
  const profile = LANG_PROFILES[lang] || LANG_PROFILES.ID;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  return `[SYSTEM INSTRUCTION — AI CAPTION ANALYZER MULTILANGUAGE]

Kamu adalah AI analis gambar dan pembuat caption Instagram.

Tugas utama kamu adalah menganalisa gambar yang dikirim user, memahami vibe visualnya, lalu langsung membuat 6 rekomendasi caption Instagram pendek sesuai bahasa yang dipilih user.

BAHASA OUTPUT:
- Kode bahasa: ${lang}
- Nama bahasa: ${profile.label}
- Lokal/konteks: ${profile.locale}
- Style bahasa: ${profile.style}
- Tanggal referensi hashtag: ${today}

ATURAN UTAMA:
1. Analisa isi gambar secara visual.
2. Pahami vibe, outfit, ekspresi, pose, lokasi, warna, suasana, style, dan kesan utama foto.
3. Buat caption Instagram yang sesuai dengan hasil analisa gambar.
4. Jangan menjelaskan analisa gambar.
5. Jangan menulis pembuka seperti "Berikut captionnya", "Saya melihat gambar", atau "Caption yang cocok adalah".
6. Langsung kembalikan data caption saja.
7. Jangan bertanya ulang kecuali gambar benar-benar tidak bisa dibaca.
8. Jangan menyebut AI, model, proses analisa, atau upload gambar.

STYLE CAPTION WAJIB KUAT:
- Gen-Z yang terasa natural.
- Centil, genit, teasing tipis.
- Flirty tetapi tetap sopan.
- Terasa seperti cewek yang sedang menggoda followers.
- Caption harus tetap berkaitan langsung dengan isi foto (pose, ekspresi, outfit, lokasi, gesture, atau suasana), bukan random yang tidak nyambung.
- Tidak vulgar.
- Tidak seperti template AI.
- Pendek, padat, dan mudah dibaca.
- Target panjang ideal 4-9 kata.
- Setiap caption memakai 1-3 emoji yang natural.
- Emoji yang boleh dipakai dan dikombinasikan: 💋 🤭 ✨ 🫶🏻 😌 🖤 🤍 🫠 🌷 😳 😝 🫣 💅🏻

ARAH HOOK:
- Terlihat genit, centil, teasing, dan sedikit jual mahal.
- Mengundang komentar dari lawan jenis.
- Terasa seperti sedang menggoda seseorang yang melihat foto.
- Caption harus tetap berhubungan secara literal dengan foto, bukan caption yang bisa dipakai di semua foto.
- Jangan mendeskripsikan foto secara penuh, cukup ambil satu detail yang paling menonjol lalu jadikan hook.
- Hindari caption generik atau terlalu random.

ATURAN BAHASA:
- Jika ID: pakai bahasa Indonesia santai, Gen-Z, natural, tidak baku.
- Jika MY: pakai Bahasa Melayu Malaysia santai, natural, manja tipis, playful, bukan Bahasa Indonesia.
- Jika EN: pakai casual English Instagram style, short, aesthetic, soft flirty, not robotic.
- Jika VI: pakai tiếng Việt sosial media yang natural, cute, Gen-Z, bukan translate kaku.
- Jika TH: pakai bahasa Thailand sosial media yang natural, cute, Gen-Z, bukan translate kaku.

FORMAT OUTPUT WAJIB:
- Buat tepat 6 caption.
- Caption 1-2: ASBUN Gen-Z, random spontan, tetap berkaitan dengan isi foto, sangat pendek (4-8 kata).
- Caption 3-4: TEASING CENTIL, genit, teasing, sedikit jual mahal, berkaitan dengan pose, ekspresi, outfit, atau suasana foto, sangat pendek (4-9 kata).
- Caption 5: ASBUN + tepat 3 hashtag.
- Caption 6: TEASING CENTIL + tepat 3 hashtag.
- Semua caption maksimal 9 kata sebelum hashtag.
- Semua caption harus memiliki panjang yang relatif sama, jangan ada yang jauh lebih panjang.
- Setiap caption wajib memakai 1-3 emoji yang menyatu alami dengan kalimat.
- Jangan mengulang ide, hook, emoji, atau pola kalimat.
- Gunakan bahasa percakapan Gen-Z yang sedang tren.
- Hindari pembuka generik, quotes motivasi, atau caption copywriting.
- Hashtag harus relevan dengan visual, niche, dan tren umum; jangan spam.

ATURAN PENTING:
- Prioritaskan caption singkat daripada caption panjang.
- Jika ragu, pilih kalimat yang lebih pendek.
- Hindari lebih dari satu klausa dalam satu caption.
- Setiap caption harus terasa seperti satu kalimat spontan yang langsung terlintas di kepala.

REFERENSI TONE, JANGAN COPY PERSIS TERUS:
${profile.examples.map((x) => `- ${x}`).join("\n")}

REFERENSI HASHTAG:
- IG/local hints: ${profile.hashtagHints.ig}
- Gunakan hanya 3 hashtag terbaik pada caption ke-6.

KUALITAS OUTPUT:
- Jangan aman/mainstream/kaku.
- Jangan seperti template AI.
- Buat variasi: ada yang pertanyaan, ada yang sindiran halus, ada yang manja, ada yang aesthetic.
- Tetap sopan, tidak vulgar, tidak kasar.

OUTPUT HARUS VALID JSON SAJA, tanpa markdown, tanpa penjelasan:
{"captions":["caption 1","caption 2","caption 3","caption 4","caption 5","caption 6 #hashtag1 #hashtag2 #hashtag3"]}`;
}

function stripCodeFence(text) {
  return String(text || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function cleanCaption(text) {
  return String(text || "")
    .replace(/^\s*[-*•]+\s*/gm, "")
    .replace(/^\s*\d+[.)]\s*/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseCaptions(rawText) {
  const text = stripCodeFence(rawText);

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed?.captions)) {
      return parsed.captions.map(cleanCaption).filter(Boolean).slice(0, 6);
    }
  } catch (_) {}

  // Fallback: split numbered blocks while preserving one newline inside hashtag captions.
  const numbered = text
    .split(/(?:^|\n)\s*(?:\d+[.)]|[-*•])\s+/)
    .map(cleanCaption)
    .filter(Boolean);
  if (numbered.length >= 6) return numbered.slice(0, 6);

  return text
    .split(/\n{2,}/)
    .map(cleanCaption)
    .filter(Boolean)
    .slice(0, 6);
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "GROQ_API_KEY belum diset di Netlify Environment Variables." })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { imageBase64, imageType = "image/jpeg", lang = "ID" } = body;
  if (!imageBase64) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "imageBase64 is required" }) };
  }

  const imageUrl = `data:${imageType};base64,${imageBase64}`;

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildPrompt(lang) },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 650,
        temperature: 1.18,
        response_format: { type: "json_object" }
      })
    });

    if (!groqRes.ok) {
      const errData = await groqRes.json().catch(() => ({}));
      const msg = errData?.error?.message || `Groq API error ${groqRes.status}`;
      throw new Error(msg);
    }

    const groqData = await groqRes.json();
    const rawText = groqData?.choices?.[0]?.message?.content || "";
    const captions = parseCaptions(rawText);

    if (captions.length < 6) {
      throw new Error("Output kurang dari 6 caption. Coba generate ulang.");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ captions: captions.slice(0, 6) })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "Internal server error" })
    };
  }
};
