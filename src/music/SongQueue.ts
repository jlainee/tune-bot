import { Song } from '../interfaces/Song';

export class SongQueue {
  private queue: Song[] = [];
  private currentSongIndex: number = 0;

  getCurrrentSong(): Song | null {
    return this.queue.length > 0 ? this.queue[this.currentSongIndex] : null;
  }

  addSong(song: Song): number {
    this.queue.push(song);

    return this.queue.length - 1;
  }

  skipSong(): void {
    if (this.queue.length === 0) {
      return;
    }

    this.queue.shift();
  }

  removeSong(index: number): boolean {
    if (index < 0 || index >= this.queue.length) {
      return false;
    }

    this.queue.splice(index, 1)[0];
    return true;
  }

  clearQueue(): void {
    this.queue = [];
  }

  getQueue(): Song[] {
    return this.queue;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}
