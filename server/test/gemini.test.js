import test from 'node:test';
import assert from 'node:assert/strict';

import { getGeminiUserMessage } from '../src/gemini.js';

test('returns guidance for invalid API key', () => {
  const info = getGeminiUserMessage({ status: 400 }, {
    error: {
      status: 'INVALID_ARGUMENT',
      message: 'API key not valid. Please pass a valid API key.',
      details: [{ reason: 'API_KEY_INVALID' }],
    },
  });

  assert.match(info, /Google AI Studio|GEMINI_API_KEY|anahtar/i);
});

test('returns quota message for rate limits', () => {
  const info = getGeminiUserMessage({ status: 429 }, {
    error: { message: 'Rate limit exceeded' },
  });

  assert.match(info, /kota|daha sonra/i);
});

test('returns transient overload message when Gemini is busy', () => {
  const info = getGeminiUserMessage({ status: 503 }, {
    error: { message: 'This model is currently experiencing high demand. Spikes in demand are usually temporary.' },
  });

  assert.match(info, /yoğunluk|daha sonra|geçici/i);
});

test('returns size guidance when the uploaded image is too large', () => {
  const info = getGeminiUserMessage({ status: 413 }, {
    error: { message: 'Request entity too large' },
  });

  assert.match(info, /çok büyük|daha küçük|küçült/i);
});

test('returns image-format guidance when base64 payload is invalid', () => {
  const info = getGeminiUserMessage({ status: 400 }, {
    error: {
      message: "Invalid value at 'contents[0].parts[1].inline_data.data' (TYPE_BYTES), Base64 decoding failed",
    },
  });

  assert.match(info, /görsel|fotoğraf|JPEG|bozuk|küçük/i);
});

test('returns generic failure message otherwise', () => {
  const info = getGeminiUserMessage({ status: 502 }, {
    error: { message: 'Bad gateway' },
  });

  assert.match(info, /Gemini OCR isteği başarısız oldu|Google API/i);
});
