// MMK-CAPTION - Netlify Function
// Vision caption generator for IG/FB style captions.

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const LANG_PROFILES = {
  ID: {
    label: "Bahasa Indonesia",
    locale: "Indonesia",
    style: "bahasa Indonesia gaul sosmed, natural, tidak baku, cocok untuk caption IG/FB Indonesia",
    examples: [
      "jangan cuma diliatin, disapa juga boleh 🤭",
      "mode kalem, tapi bikin kepikiran 😌✨",
      "senyum dikit biar harimu aman ya 😝"
    ],
    hashtagHints: {
      ig: "#fyp #explorepage #viral #ootd #selfie #cantik #indonesia #reelsindonesia",
      fb: "#fbviral #fypfb #facebookpost #viralindonesia #captionfb #fotohariini"
    }
  },
  EN: {
    label: "English",
    locale: "global English IG/FB audience",
    style: "casual social-media English, playful, short, non-formal, IG/FB native",
    examples: [
      "don’t just stare, say hi 🤭",
      "soft look, dangerous effect 😌✨",
      "cute enough to ruin your focus 😝"
    ],
    hashtagHints: {
      ig: "#explorepage #fyp #viral #instagood #photooftheday #selfie #reels",
      fb: "#facebookviral #fbpost #viralpost #trendingnow #photooftheday #socialpost"
    }
  },
  MY: {
    label: "Bahasa Melayu Malaysia",
    locale: "Malaysia",
    style: "Bahasa Melayu santai Malaysia, slang ringan, bukan baku Indonesia, natural untuk IG/FB Malaysia",
    examples: [
      "tengok je ke, tak nak tegur? 🤭",
      "nampak soft, tapi bahaya sikit 😌✨",
      "senyum sikit, terus hilang fokus kan 😝"
    ],
    hashtagHints: {
      ig: "#fypmalaysia #explorepage #viralmalaysia #ootdmalaysia #selfiemalaysia #malaysiagirl",
      fb: "#fbviralmalaysia #facebookmalaysia #viralmalaysia #captionfb #fotomalaysia #trendingmalaysia"
    }
  },
  TH: {
    label: "ภาษาไทย",
    locale: "Thailand",
    style: "ภาษาไทยสไตล์โซเชียล IG/FB, เป็นธรรมชาติ, ขี้เล่น, ไม่เป็นทางการ, ใช้คำไทยวัยรุ่นแบบสุภาพ",
    examples: [
      "มองเฉย ๆ ไม่ทักหน่อยเหรอ 🤭",
      "ลุคใส ๆ แต่ทำใจสั่นนะ 😌✨",
      "ยิ้มให้แล้วนะ ห้ามใจละลาย 😝"
    ],
    hashtagHints: {
      ig: "#ฟีด #ติดเทรนด์ #ไวรัล #สาวไทย #น่ารัก #ถ่ายรูป #ไอจีไทย",
      fb: "#เฟซบุ๊กไวรัล #โพสต์เฟซบุ๊ก #ไวรัลไทย #แคปชั่นเฟซบุ๊ก #รูปวันนี้"
    }
  },
  VI: {
    label: "Tiếng Việt",
    locale: "Vietnam",
    style: "tiếng Việt mạng xã hội tự nhiên, trẻ trung, thả thính nhẹ, không trang trọng, đúng vibe IG/FB Việt Nam",
    examples: [
      "nhìn thôi à, không định chào sao 🤭",
      "ngoài thì dịu, trong thì hơi nguy hiểm 😌✨",
      "cười nhẹ một cái cho ai đó mất tập trung 😝"
    ],
    hashtagHints: {
      ig: "#xuhuong #viral #fyp #gaixinh #vietnam #selfie #instavietnam",
      fb: "#facebookviral #xuhuongfacebook #viralvietnam #captionfacebook #anhdep #homnay"
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

  return `You are an expert IG/FB social caption writer. Analyze the image and write captions in ${profile.label} for ${profile.locale}.

TODAY: ${today}
LANGUAGE STYLE: ${profile.style}

Main goal:
- Captions must feel like real social media captions, not formal copywriting.
- Short, punchy, flirty/playful, natural, and photo-aware.
- Avoid stiff, corporate, poetic, or over-explained language.
- Use correct spelling, punctuation, and native phrasing for ${profile.label}.
- Use 1-3 fitting emojis per caption.
- Do not mention AI, image analysis, or that you are reading a photo.
- Do not use sexual explicit language, minors, or adult-service wording.

Output structure: EXACTLY 6 recommendations.
1-2: very strong hook captions; highly attention-grabbing.
3-4: captions adjusted to the photo mood, outfit, expression, and vibe.
5: Instagram caption with hashtags. Put the caption text first, then exactly ONE newline, then IG hashtags.
6: Facebook caption with hashtags. Put the caption text first, then exactly ONE newline, then FB hashtags.

Hashtag rules:
- Use hashtags that feel currently popular and locally relevant for ${profile.locale} as of TODAY.
- IG hashtag direction: ${profile.hashtagHints.ig}
- FB hashtag direction: ${profile.hashtagHints.fb}
- Match hashtags to the selected language and photo content.
- For #5 use IG-style hashtags only.
- For #6 use FB-style hashtags only.
- Keep hashtags readable; 5-8 hashtags per caption.

Example tone references:
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
        max_tokens: 900,
        temperature: 0.95,
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
