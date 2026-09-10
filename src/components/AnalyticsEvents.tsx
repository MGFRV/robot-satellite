'use client';
import { useEffect } from 'react';
import { trackGoal } from '@/lib/analytics';
export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest('a');
      const href = link?.getAttribute('href') || '';
      if (href.startsWith('tel:')) trackGoal('phone_click');
      else if (href.startsWith('mailto:')) trackGoal('click_email');
      else if (/wa\.me|whatsapp|t\.me|telegram|max\.ru/i.test(href)) trackGoal('messenger_click');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
