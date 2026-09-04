import { createReadStream } from 'node:fs';
import csv from 'csv-parser';

import type {
  RawLinkedInRow,
  SanitizedProfileInput,
} from '../types/profile.types.js';
import { sanitizeLinkedInRow } from './sanitize.js';

export type ProfileStreamOptions = {
  filePath: string;
  onProfile: (profile: SanitizedProfileInput) => Promise<void> | void;
  onInvalidRow?: (row: RawLinkedInRow) => void;
};

export async function streamLinkedInProfiles(
  options: ProfileStreamOptions,
): Promise<{ processed: number; skipped: number }> {
  let processed = 0;
  let skipped = 0;

  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(options.filePath).pipe(csv());

    const processNext = async (row: RawLinkedInRow): Promise<void> => {
      const profile = sanitizeLinkedInRow(row);
      if (!profile) {
        skipped += 1;
        options.onInvalidRow?.(row);
        return;
      }

      processed += 1;
      await options.onProfile(profile);
    };

    const queue: RawLinkedInRow[] = [];
    let reading = false;
    let ended = false;

    const drainQueue = async (): Promise<void> => {
      if (reading) {
        return;
      }

      reading = true;
      stream.pause();

      while (queue.length > 0) {
        const row = queue.shift();
        if (!row) {
          break;
        }

        try {
          await processNext(row);
        } catch (error) {
          reject(error);
          return;
        }
      }

      reading = false;

      if (ended && queue.length === 0) {
        resolve();
        return;
      }

      stream.resume();
    };

    stream.on('data', (row: RawLinkedInRow) => {
      queue.push(row);
      void drainQueue();
    });

    stream.on('end', () => {
      ended = true;
      void drainQueue();
    });

    stream.on('error', reject);
  });

  return { processed, skipped };
}

export async function loadLinkedInProfilesFromFile(
  filePath: string,
): Promise<SanitizedProfileInput[]> {
  const profiles: SanitizedProfileInput[] = [];

  await streamLinkedInProfiles({
    filePath,
    onProfile: async (profile) => {
      profiles.push(profile);
    },
  });

  return profiles;
}
