import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveApiBaseUrl } from './constants.ts';

test('prefers VITE_API_DOMAIN when provided without protocol', () => {
  const baseUrl = resolveApiBaseUrl({
    VITE_API_DOMAIN: 'api.example.com',
  });

  assert.equal(baseUrl, 'https://api.example.com');
});

test('falls back to NEXT_PUBLIC_API_DOMAIN for deployed domains', () => {
  const baseUrl = resolveApiBaseUrl({
    NEXT_PUBLIC_API_DOMAIN: 'chatappwebsocket-production.up.railway.app',
  });

  assert.equal(baseUrl, 'https://chatappwebsocket-production.up.railway.app');
});

test('prefers NEXT_PUBLIC_API_DOMAIN over stale VITE_API_DOMAIN values', () => {
  const baseUrl = resolveApiBaseUrl({
    VITE_API_DOMAIN: 'localhost:8080',
    NEXT_PUBLIC_API_DOMAIN: 'chatappwebsocket-production.up.railway.app',
  });

  assert.equal(baseUrl, 'https://chatappwebsocket-production.up.railway.app');
});

test('keeps localhost on http when using local domain values', () => {
  const baseUrl = resolveApiBaseUrl({
    NEXT_PUBLIC_API_DOMAIN: 'localhost:8080',
  });

  assert.equal(baseUrl, 'http://localhost:8080');
});
