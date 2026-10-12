export function getGeminiUserMessage(response, payload = {}) {
  const message = String(payload?.error?.message ?? '');
  const details = Array.isArray(payload?.error?.details) ? payload.error.details : [];
  const hasInvalidApiKey = /API key not valid|API_KEY_INVALID|invalid api key|api key/i.test(
    `${message} ${details.map((detail) => `${detail?.reason ?? ''} ${detail?.message ?? ''}`).join(' ')}`,
  );

  if (response?.status === 400 && hasInvalidApiKey) {
    return 'Gemini API anahtarı geçersiz. Google AI Studio üzerinden yeni bir API anahtarı oluşturup server/.env dosyasındaki GEMINI_API_KEY değerini güncelleyin.';
  }

  if (response?.status === 429 || /rate limit|quota|kota/i.test(message)) {
    return 'Gemini OCR kotası doldu. Biraz sonra tekrar deneyin.';
  }

  if (response?.status === 413 || /request entity too large|too large|çok büyük/i.test(message)) {
    return 'Seçilen görsel çok büyük. Lütfen daha küçük bir fotoğraf seç veya resmi küçültüp tekrar dene.';
  }

  if (response?.status === 503 || /high demand|temporarily unavailable|unavailable|currently experiencing high demand/i.test(message)) {
    return 'Gemini şu anda yoğunluk nedeniyle geçici olarak ulaşılamıyor. Birkaç dakika sonra tekrar deneyin.';
  }

  if (!response || response.status >= 500 || /bad gateway|service unavailable|internal error/i.test(message)) {
    return 'Gemini OCR isteği başarısız oldu. Google API erişimi ve API anahtarı kontrol edilmelidir.';
  }

  return 'Gemini OCR isteği başarısız oldu.';
}
