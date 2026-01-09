/**
 * Article Lifecycle Hooks
 * 
 * Automatically triggers static page generation and SEO submission
 * when articles are created, updated, or deleted.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const FRONTEND_PATH = process.env.FRONTEND_PATH || '/home/kevin/creaty';

async function regenerateStaticPages(): Promise<void> {
  console.log('🔄 [Lifecycle] Triggering static page regeneration...');
  
  try {
    // 1. Generate static HTML pages for all articles
    const { stdout: genOutput } = await execAsync(
      `node ${FRONTEND_PATH}/js/generate-static-blog.js`,
      { cwd: FRONTEND_PATH, timeout: 60000 }
    );
    console.log('📄 [Lifecycle] Static pages generated:', genOutput.split('\n').slice(-5).join('\n'));

    // 2. Submit to IndexNow for instant indexing
    const { stdout: idxOutput } = await execAsync(
      `node ${FRONTEND_PATH}/js/submit-indexnow.js`,
      { cwd: FRONTEND_PATH, timeout: 30000 }
    );
    console.log('🔔 [Lifecycle] IndexNow submitted:', idxOutput.split('\n').slice(-3).join('\n'));

    console.log('✅ [Lifecycle] Regeneration complete!');
  } catch (error) {
    console.error('❌ [Lifecycle] Regeneration error:', error.message);
  }
}

// Debounce to prevent multiple rapid regenerations
let regenerationTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_MS = 5000;

function scheduleRegeneration(): void {
  if (regenerationTimeout) {
    clearTimeout(regenerationTimeout);
  }
  regenerationTimeout = setTimeout(() => {
    regenerateStaticPages();
    regenerationTimeout = null;
  }, DEBOUNCE_MS);
}

export default {
  async afterCreate() {
    console.log('📝 [Lifecycle] Article created - scheduling regeneration');
    scheduleRegeneration();
  },

  async afterUpdate() {
    console.log('✏️ [Lifecycle] Article updated - scheduling regeneration');
    scheduleRegeneration();
  },

  async afterDelete() {
    console.log('🗑️ [Lifecycle] Article deleted - scheduling regeneration');
    scheduleRegeneration();
  },
};
