const { createAdSlot, setPublisherId, getPublisherId, getAdSenseScript, generateAdPushScript } = require('../ads');

describe('Ads Advanced Coverage', () => {
  test('publisherId management', () => {
    setPublisherId('ca-pub-test');
    expect(getPublisherId()).toBe('ca-pub-test');
    expect(() => setPublisherId('')).toThrow();
  });

  test('createAdSlot generating HTML', () => {
    setPublisherId('ca-pub-999');
    const html = createAdSlot('slot-123', 'banner');
    expect(html).toContain('slot-123');
    expect(html).toContain('ca-pub-999');
    
    // Test throwing on missing slot
    expect(() => createAdSlot('', 'banner')).toThrow();
  });

  test('helper scripts generation', () => {
    expect(getAdSenseScript()).toContain('https://pagead2.googlesyndication.com');
    expect(generateAdPushScript(2)).toContain('push({})');
    expect(generateAdPushScript(0)).toContain('push({})'); // default to 1
  });
});
