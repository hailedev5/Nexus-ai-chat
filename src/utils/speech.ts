/**
 * Speech synthesis helper for reading chat messages aloud
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function speakMessage(
  text: string,
  isAi: boolean,
  onEnd?: () => void,
  onError?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown formatting for cleaner speech
  const cleanText = text
    .replace(/```[\s\S]*?```/g, ' [code snippet omitted] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#+\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();

  if (!cleanText) return false;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.0;
  utterance.pitch = isAi ? 1.05 : 0.98;

  // Try to pick suitable voices
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      if (isAi) {
        // Prefer natural or female/smooth sounding voice for AI
        const preferred = englishVoices.find(
          (v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')
        );
        utterance.voice = preferred || englishVoices[0];
      } else {
        const preferred = englishVoices.find(
          (v) => v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Daniel')
        );
        utterance.voice = preferred || englishVoices[englishVoices.length - 1];
      }
    }
  }

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    onError?.();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  return window.speechSynthesis.speaking;
}
