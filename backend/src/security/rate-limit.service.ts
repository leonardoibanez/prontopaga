import { Injectable } from '@nestjs/common';

type RateLimitEntry = { count: number; resetAt: number };
const MAX_ENTRIES = 10_000;

@Injectable()
export class RateLimitService {
  private readonly entries = new Map<string, RateLimitEntry>();

  consume(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
    const current = this.entries.get(key);
    if (current === undefined || current.resetAt <= now) {
      this.prune(now);
      if (current === undefined && this.entries.size >= MAX_ENTRIES) return false;
      this.entries.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (current.count >= limit) return false;
    current.count += 1;
    return true;
  }

  private prune(now: number): void {
    if (this.entries.size < MAX_ENTRIES) return;
    for (const [key, entry] of this.entries) {
      if (entry.resetAt <= now) this.entries.delete(key);
    }
  }
}
