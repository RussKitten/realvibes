import type { ListingLine } from '../types';

export function splitCodeToLines(code: string): ListingLine[] {
  const normalized = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const raw = normalized.split('\n');
  if (raw.length > 0 && raw[raw.length - 1] === '') {
    raw.pop();
  }
  return raw.map((content, index) => ({ number: index + 1, content }));
}

export function paginateLines(lines: ListingLine[], perPage: number): ListingLine[][] {
  const safe = Math.max(1, Math.floor(perPage));
  const pages: ListingLine[][] = [];
  for (let i = 0; i < lines.length; i += safe) {
    pages.push(lines.slice(i, i + safe));
  }
  return pages;
}
