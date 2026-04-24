// useVoice — Smart TTS hook with Uzbek language support
import { useCallback, useRef } from 'react';

export default function useVoice() {
  const activeRef = useRef(null);

  const speak = useCallback((text, lang = 'uz') => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);

    // Tanlangan tilga mos ovozni qidirish
    const voices = window.speechSynthesis.getVoices();
    const langMap = { 'uz': 'uz-UZ', 'ru': 'ru-RU', 'en': 'en-US' };
    const targetLang = langMap[lang] || 'uz-UZ';

    const voice = voices.find(v => v.lang.startsWith(targetLang)) || 
                  voices.find(v => v.lang.startsWith('ru')) || 
                  voices.find(v => v.lang.startsWith('en'));
                  
    if (voice) u.voice = voice;
    u.lang  = targetLang;
    u.rate  = 0.9;
    u.pitch = 1.0;

    activeRef.current = u;
    window.speechSynthesis.speak(u);
  }, []);


  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
}
