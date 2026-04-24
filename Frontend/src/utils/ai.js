const API_URL = "https://ai-hackaton-namangan-production.up.railway.app/api/ai";

export const translateText = async (text) => {
  if (!text) return null;

  try {
    const response = await fetch(`${API_URL}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("AI Translation Error:", error);
    // Xatolik bo'lsa barchasiga bir xil matnni qaytaradi
    return { uz: text, ru: text, en: text };
  }
};
