import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tokensCss = readFileSync(resolve(__dirname, 'tokens.css'), 'utf8');
const indexHtml = readFileSync(resolve(__dirname, '../../index.html'), 'utf8');

describe('design tokens (T18)', () => {
  const required = [
    '--lm-color-primary', '--lm-color-primary-hover',
    '--lm-color-sidebar', '--lm-color-bg', '--lm-color-surface',
    '--lm-color-text', '--lm-color-muted', '--lm-color-border',
    '--lm-color-danger', '--lm-color-success',
    '--lm-radius-sm', '--lm-radius-md',
    '--lm-space-1', '--lm-space-2', '--lm-space-3', '--lm-space-4', '--lm-space-5', '--lm-space-6',
    '--lm-font-base',
  ];
  for (const token of required) {
    it(`defines ${token}`, () => {
      expect(tokensCss).toMatch(new RegExp(`${token.replace(/-/g, '\\-')}\\s*:`));
    });
  }
  it('--lm-color-sidebar equals #1A252F (case-insensitive)', () => {
    expect(tokensCss).toMatch(/--lm-color-sidebar\s*:\s*#1A252F/i);
  });
  it('--lm-color-primary is a 6-digit hex', () => {
    expect(tokensCss).toMatch(/--lm-color-primary\s*:\s*#[0-9a-fA-F]{6}/);
  });
});

describe('document head (T18)', () => {
  it('title is ЛампоМаркет', () => {
    expect(indexHtml).toMatch(/<title>\s*ЛампоМаркет\s*<\/title>/);
  });
  it('html lang is ru', () => {
    expect(indexHtml).toMatch(/<html\s+[^>]*lang="ru"/);
  });
});
