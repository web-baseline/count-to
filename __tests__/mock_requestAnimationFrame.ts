import { vi } from 'vitest';

export class RequestAnimationFrameMockSession {
  handleCounter = 0;
  queue = new Map<number, FrameRequestCallback>();
  requestAnimationFrame (callback: FrameRequestCallback) {
    const handle = this.handleCounter++;
    this.queue.set(handle, callback);
    return handle;
  }

  cancelAnimationFrame (handle: number) {
    this.queue.delete(handle);
  }

  triggerNextAnimationFrame (time = performance.now()) {
    const nextEntry = this.queue.entries().next().value;
    if (nextEntry === undefined) return;

    const [nextHandle, nextCallback] = nextEntry;

    nextCallback(time);
    this.queue.delete(nextHandle);
  }

  triggerAllAnimationFrames (time = performance.now()) {
    while (this.queue.size > 0) this.triggerNextAnimationFrame(time);
  }

  reset () {
    this.queue.clear();
    this.handleCounter = 0;
  }
}

export const requestAnimationFrameMock = new RequestAnimationFrameMockSession();

export const source = {
  requestAnimationFrame: vi.fn(window.requestAnimationFrame),
  cancelAnimationFrame: vi.fn(window.cancelAnimationFrame),
} as const;

window.requestAnimationFrame = source.requestAnimationFrame;
window.cancelAnimationFrame = source.cancelAnimationFrame;
