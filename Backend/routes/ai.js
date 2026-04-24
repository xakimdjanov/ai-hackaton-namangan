const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * /api/ai/translate:
 *   post:
 *     summary: Translate text into UZ, RU, EN using AI
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Translated text in 3 languages
 */
router.post('/translate', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional translator. Translate the input text into Uzbek, Russian, and English. Respond ONLY with a valid JSON object in this format: {\"uz\": \"...\", \"ru\": \"...\", \"en\": \"...\"}"
        },
        {
          role: "user",
          content: text
        }
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const content = response.data.choices[0].message.content;
    // Ba'zan AI JSON ni ```json ... ``` ichida qaytarishi mumkin, shuni tozalaymiz
    const cleanJson = content.replace(/```json|```/g, '').trim();
    const translations = JSON.parse(cleanJson);
    
    res.json(translations);
  } catch (error) {
    console.error("AI Translation Error:", error.response?.data || error.message);
    res.status(500).json({ 
      uz: text, 
      ru: text, 
      en: text,
      error: 'AI translation failed' 
    });
  }
});

module.exports = router;
