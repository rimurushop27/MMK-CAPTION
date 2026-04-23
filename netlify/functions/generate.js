// MMK-CAPTION - Netlify Function
// Model: meta-llama/llama-4-scout-17b-16e-instruct (Groq Vision)

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const PROMPTS = {
  ID: `Kamu adalah ahli copywriting media sosial khusus caption foto cewek untuk fanspage Facebook/Instagram Malaysia.
Analisa foto yang diberikan, lalu buat TEPAT 5 caption pendek dalam Bahasa Indonesia gaul/kasual (bukan bahasa baku).
Gaya caption: flirty, menggoda, manja, bikin penasaran cowok.
Gunakan sapaan seperti "mas", "kak", "bang", "abang", atau "kamu".
Setiap caption 1-2 baris saja, kombinasi dengan emoji yang cocok (1-3 emoji per caption).
Referensi gaya bahasa dari caption IG/FB populer.

Contoh gaya yang benar:
- Hallo mas ðŸ¤­ lagi ngapain?
- Kangen diajak jalan gak sih? ðŸ¥ºðŸ’•
- Aku nunggu lho, mau ke sini gak? ðŸ˜
- Katanya mau chat aku, mana? ðŸ’‹
- Diperhatiin dikit boleh ya ðŸŒ¸ðŸ˜Š

Format output: tulis hanya 5 caption, satu per baris, tanpa nomor, tanpa penjelasan tambahan.`,

  EN: `You are a social media copywriting expert for a Malay girl fanspage on Facebook/Instagram.
Analyze the photo and create EXACTLY 5 short flirty captions in casual English (not formal).
Style: flirty, playful, teasing, making guys curious and attracted.
Use terms like "hey", "you", "babe", "cutie", natural social media vibes.
Each caption is 1-2 lines only, include 1-3 fitting emojis per caption.
Reference popular IG/FB caption styles.

Example style:
- Hey you, still thinking about me? ðŸ¤­
- Not sorry for being this cute ðŸ’…âœ¨
- Come find me if you dare ðŸ˜ðŸ’‹
- Someone's staring... hi there ðŸ‘€ðŸŒ¸
- Soft on the outside, trouble on the inside ðŸ˜ˆðŸ’•

Format: write only 5 captions, one per line, no numbers, no extra explanation.`,

  MY: `Kau pakar copywriting media sosial untuk fanspage Facebook/Instagram cewek Melayu.
Analisis gambar yang diberikan, kemudian tulis TEPAT 5 caption pendek dalam Bahasa Melayu slang/kasual (bukan bahasa formal atau baku).
Gaya: flirty, goda-goda, manja, buat lelaki terpikat dan penasaran.
Guna sapaan seperti "awak", "abang", "kanda", "dia", atau sebutan kasual Melayu.
Setiap caption 1-2 baris je, gabungkan dengan emoji yang sesuai (1-3 emoji per caption).
Ikut gaya caption popular di IG/FB Malaysia.

Contoh gaya yang betul:
- Hi awak ðŸ’‹ ingat aku tak?
- Kau ingat nak ajak aku makan, bila? ðŸ¥ºðŸ’•
- Soft je dari luar, dalam tu lain cerita ðŸ˜
- Tengok je ke, tak mau tegur ke? ðŸ‘€ðŸŒ¸
- Rindu tu tanggung sendiri tau ðŸ˜ŒðŸ’œ

Format output: tulis 5 caption sahaja, satu baris satu caption, tanpa nombor, tanpa penjelasan tambahan.`
};

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "GROQ_API_KEY belum diset di Netlify Environment Variables!" })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { imageBase64, imageType = "image/jpeg", lang = "ID" } = body;

  if (!imageBase64) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "imageBase64 is required" }) };
  }

  const systemPrompt = PROMPTS[lang] || PROMPTS["ID"];
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
              { type: "text", text: systemPrompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 600,
        temperature: 0.9
      })
    });

    if (!groqRes.ok) {
      const errData = await groqRes.json().catch(() => ({}));
      const msg = errData?.error?.message || `Groq API error ${groqRes.status}`;
      throw new Error(msg);
    }

    const groqData = await groqRes.json();
    const rawText = groqData?.choices?.[0]?.message?.content || "";

    // Parse captions: split by newlines, clean empty lines
    const captions = rawText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.length < 300)
      .slice(0, 5);

    if (captions.length === 0) {
      throw new Error("Tidak ada caption yang dihasilkan.");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ captions })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "Internal server error" })
    };
  }
};
