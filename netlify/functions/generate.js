// MMK-CAPTION - Netlify Function
// Vision caption generator for short flirty IG/FB fanpage captions.

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const LANG_PROFILES = {
  ID: {
    label: "Bahasa Indonesia",
    locale: "Indonesia",
    targetAudience: "cowok Indonesia dewasa di Facebook/Instagram",
    style: "bahasa Indonesia santai, genit ringan, pendek, terasa seperti cewek di sosmed, bukan copywriting dan bukan caption formal",
    examples: [
      "halo mas 🤭",
      "jangan cuma lihat, sapa dong 😌",
      "senyum dikit, biar mas kepikiran 💋",
      "yang berani komen duluan siapa? 😝"
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
    style: "short flirty social-media English, playful and casual, not formal, not poetic, like a real IG/FB caption",
    examples: [
      "hey you 🤭",
      "don’t just stare, say hi 😌",
      "careful, I might stay on your mind 💋",
      "who’s brave enough to comment first? 😝"
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
    style: "Bahasa Melayu Malaysia santai, ayat pendek, manja dan mengusik ringan, bukan Bahasa Indonesia, bukan ayat formal",
    examples: [
      "hi awak 💋",
      "tengok je ke, tak nak tegur? 🤭",
      "senyum sikit, biar awak ingat 😌",
      "siapa berani komen dulu? 😝"
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
    style: "ภาษาไทยโซเชียลแบบสั้น ๆ ขี้เล่น อ่อยเบา ๆ สุภาพ เป็นธรรมชาติ ไม่เป็นทางการ ไม่เหมือนแปลตรงตัว",
    examples: [
      "ทักหน่อยได้ไหมคะ 🤭",
      "มองเฉย ๆ ไม่คิดจะทักเหรอ 😌",
      "ยิ้มให้แล้วนะ ใจสั่นยัง 💋",
      "ใครกล้าคอมเมนต์ก่อน 😝"
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
    style: "tiếng Việt mạng xã hội ngắn, thả thính nhẹ, đáng yêu, tự nhiên, không trang trọng, không dịch máy",
    examples: [
      "chào anh 🤭",
      "nhìn thôi à, không chào em sao 😌",
      "cười nhẹ vậy thôi mà nhớ chưa 💋",
      "ai dám bình luận đầu tiên nào 😝"
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

  return `You are a specialist Facebook/Instagram fanpage caption writer.
Analyze the uploaded image and create short captions in ${profile.label} for ${profile.locale}.

CONTEXT:
- The user is building a Facebook fanpage with photos of Malay / Southeast Asian women.
- The goal is engagement from ${profile.targetAudience}: comments, reactions, profile visits, and light DM curiosity.
- Captions should feel like a real girl posting casually, not a brand, not an influencer agency, not formal copywriting.

TODAY: ${today}
LANGUAGE STYLE: ${profile.style}

CAPTION DIRECTION:
- Very short: ideally 2-8 words per caption.
- Flirty, teasing, cute, slightly tempting, but still safe and non-explicit.
- Use 1-3 emojis per caption, usually at the end.
- Make the captions invite men to react, comment, or greet.
- Prefer direct address when natural: "mas", "abang", "awak", "anh", "คะ", etc., depending on the selected language.
- Use simple social-media wording, not literary or descriptive sentences.
- Do NOT write long image descriptions like outfit/background/pose unless it makes the line more attractive.
- Do NOT sound formal, poetic, corporate, motivational, or robotic.
- Do NOT use vulgar sexual words, prostitution/adult-service tone, minors, or explicit body-part focus.
- Do NOT mention AI, the model, image analysis, or that a photo was uploaded.

OUTPUT STRUCTURE: EXACTLY 6 recommendations.
1-2: brutal/strong short hooks for attention, suitable for fanpage engagement.
3-4: short captions adjusted to the photo vibe, expression, outfit, and mood.
5: Instagram version: short caption first, then exactly ONE newline, then IG hashtags.
6: Facebook version: short caption first, then exactly ONE newline, then FB hashtags.

HASHTAG RULES:
- Hashtags should feel currently popular and locally relevant for ${profile.locale} as of TODAY.
- IG hashtag direction: ${profile.hashtagHints.ig}
- FB hashtag direction: ${profile.hashtagHints.fb}
- Use 5-8 hashtags for #5 and #6.
- Match hashtags to the selected language, platform, and photo vibe.
- Do not put hashtags in caption 1-4.

REFERENCE TONE, DO NOT COPY EXACTLY EVERY TIME:
${profile.examples.map((x) => `- ${x}`).join("\n")}

Return ONLY valid JSON, no markdown, no explanation:
{"captions":["caption 1","caption 2","caption 3","caption 4","caption 5\\n#hashtag #hashtag","caption 6\\n#hashtag #hashtag"]}`;
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
        temperature: 1.05,
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
