/**
 * Notification and Reminder Service for QuranHabit
 * Handles Web Notifications API, soothing audio chime synthesis,
 * and smart auto-dismissing schedule state.
 */

// Synthesize a soothing, gentle dual-tone prayer notification chime using Web Audio API
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Harmonic warm bell tones (E5 659.25Hz -> G#5 830.61Hz -> B5 987.77Hz)
    const frequencies = [659.25, 830.61, 987.77];

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.15);

      gain.gain.setValueAtTime(0, now + index * 0.15);
      gain.gain.linearRampToValueAtTime(0.18, now + index * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.15 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.15);
      osc.stop(now + index * 0.15 + 1.3);
    });
  } catch (err) {
    console.warn('Audio chime could not play:', err);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export interface InAppNotificationPayload {
  id: string;
  title: string;
  message: string;
  ayahText?: string;
  ayahKey?: string;
  progressText: string;
  timestamp: string;
}

export function triggerSystemNotification(payload: {
  title: string;
  body: string;
  icon?: string;
}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon.png',
        badge: '/icon.png',
        tag: 'quran-habit-daily',
      });
    } catch (e) {
      console.warn('Error firing native Notification:', e);
    }
  }
}
