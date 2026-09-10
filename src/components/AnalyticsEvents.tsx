'use client';
import { useEffect } from 'react';
import { trackGoal } from '@/lib/analytics';
export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest('a');
      const href = link?.getAttribute('href') || '';
      if (href.startsWith('tel:')) trackGoal('click_phone');
      else if (href.startsWith('mailto:')) trackGoal('click_email');
      else if (/wa\.me|whatsapp/i.test(href)) trackGoal('click_whatsapp');
      else if (/t\.me|telegram/i.test(href)) trackGoal('click_telegram');
      else if (/max\.ru/i.test(href)) trackGoal('click_max');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
