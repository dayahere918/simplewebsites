const { createAdSlot, getAdSenseScript, generateAdPushScript, setPublisherId, getPublisherId, AD_CONFIG } = require('../ads.js');

describe('Ads Module', () => {
  const originalPubId = getPublisherId();

  afterEach(() => {
    setPublisherId(originalPubId);
  });

  describe('set/getPublisherId', () => {
    it('throws error for invalid ID', () => {
      expect(() => setPublisherId('')).toThrow('Valid publisher ID is required');
      expect(() => setPublisherId(123)).toThrow('Valid publisher ID is required');
    });

    it('updates publisher ID correctly', () => {
      setPublisherId('ca-pub-test789');
      expect(getPublisherId()).toBe('ca-pub-test789');
      expect(AD_CONFIG.publisherId).toBe('ca-pub-test789');
    });

    it('handles numeric publisher ID error', () => {
       expect(() => setPublisherId(123)).toThrow();
    });
  });

  describe('createAdSlot', () => {
    it('throws error if slot ID is missing', () => {
      expect(() => createAdSlot()).toThrow('Ad slot ID is required');
    });

    it('generates correct banner HTML with default container ID', () => {
      const html = createAdSlot('SLOT_123', 'banner');
      expect(html).toContain('class="ad-container ad-banner"');
      expect(html).toContain('id="ad-banner-');
      expect(html).toContain('data-ad-slot="SLOT_123"');
      expect(html).toContain('data-full-width-responsive="true"');
      expect(html).toContain('data-ad-format="auto"');
    });

    it('uses provided container ID', () => {
      const html = createAdSlot('SLOT_123', 'banner', 'my-custom-ad-id');
      expect(html).toContain('id="my-custom-ad-id"');
    });

    it('generates inArticle ad correctly', () => {
      const html = createAdSlot('SLOT_456', 'inArticle');
      expect(html).toContain('class="ad-container ad-inArticle"');
      expect(html).toContain('data-ad-format="fluid"');
      expect(html).toContain('data-ad-layout-key="-fb+5w+4e-db+86"');
    });

    it('escapes slot ID and container ID', () => {
      const html = createAdSlot('SLOT"123', 'banner', 'my-id"123');
      expect(html).toContain('data-ad-slot="SLOT&quot;123"');
      expect(html).toContain('id="my-id&quot;123"');
    });
  });

  describe('getAdSenseScript', () => {
    it('generates script tag with current publisher ID', () => {
      setPublisherId('ca-pub-999');
      const script = getAdSenseScript();
      expect(script).toContain('client=ca-pub-999');
      expect(script).toContain('crossorigin="anonymous"');
    });
  });

  describe('generateAdPushScript', () => {
    it('generates single push by default', () => {
      const script = generateAdPushScript();
      const pushes = script.match(/push\({}\)/g);
      expect(pushes.length).toBe(1);
    });

    it('generates multiple pushes', () => {
      const script = generateAdPushScript(3);
      const pushes = script.match(/push\({}\)/g);
      expect(pushes.length).toBe(3);
    });

    it('handles invalid count for push script', () => {
      const script = generateAdPushScript(-5);
      expect(script).toContain('push({})');
    });

    it('handles non-string attr escaping', () => {
       const { AD_CONFIG } = require('../ads.js');
       // Internal test of escapeAttr via createAdSlot null container
       expect(createAdSlot('s', 'banner', 123)).toContain('id=""');
    });
  });
});
