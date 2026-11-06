// Optional in-process scheduler for self-hosted deployments (VPS, Docker, Railway, Render...).
// Set ENABLE_INTERNAL_CRON=true. On serverless hosts use the HTTP cron endpoint instead.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.ENABLE_INTERNAL_CRON === 'true') {
    const cron = (await import('node-cron')).default;
    const { runReminders } = await import('./lib/reminders');
    cron.schedule('*/5 * * * *', async () => {
      try {
        const r = await runReminders();
        if (r.created) console.log(`[reminders] created ${r.created} notification(s)`);
      } catch (e) {
        console.error('[reminders] failed', e.message);
      }
    });
    console.log('[reminders] internal scheduler started (every 5 minutes)');
  }
}
