import { describe, it, expect } from 'vitest';
import { validateOutboundUrl, isPrivateIPv4, isPrivateIPv6 } from '@/src/lib/security/url-allowlist';

describe('url-allowlist (SSRF guard)', () => {
  it('allows a normal https url', () => {
    expect(validateOutboundUrl('https://example.com/hook').ok).toBe(true);
  });

  it('rejects http in production mode', () => {
    expect(validateOutboundUrl('http://example.com', { allowHttp: false }).ok).toBe(false);
  });

  it('rejects localhost', () => {
    expect(validateOutboundUrl('https://localhost/x').ok).toBe(false);
    expect(validateOutboundUrl('https://127.0.0.1/x').ok).toBe(false);
  });

  it('rejects private IPv4 ranges', () => {
    expect(isPrivateIPv4('10.0.0.1')).toBe(true);
    expect(isPrivateIPv4('172.16.5.4')).toBe(true);
    expect(isPrivateIPv4('192.168.1.1')).toBe(true);
    expect(isPrivateIPv4('169.254.169.254')).toBe(true); // AWS metadata
    expect(isPrivateIPv4('8.8.8.8')).toBe(false);
  });

  it('rejects private IPv6 ranges', () => {
    expect(isPrivateIPv6('::1')).toBe(true);
    expect(isPrivateIPv6('fc00::1')).toBe(true);
    expect(isPrivateIPv6('fe80::1')).toBe(true);
    expect(isPrivateIPv6('2001:4860:4860::8888')).toBe(false);
  });

  it('rejects internal-looking suffixes', () => {
    expect(validateOutboundUrl('https://api.internal/x').ok).toBe(false);
    expect(validateOutboundUrl('https://db.local/x').ok).toBe(false);
    expect(validateOutboundUrl('https://service.corp/x').ok).toBe(false);
  });

  it('rejects malformed urls', () => {
    expect(validateOutboundUrl('not a url').ok).toBe(false);
    expect(validateOutboundUrl('').ok).toBe(false);
  });
});
