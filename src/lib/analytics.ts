export function trackGoal(goal: string) {
  if (typeof window === 'undefined') return;
  const analyticsWindow = window as typeof window & { ym?: (id: number, action: string, goal: string) => void; gtag?: (...args: unknown[]) => void };
  analyticsWindow.ym?.(109048844, 'reachGoal', goal);
  analyticsWindow.gtag?.('event', goal);
}
