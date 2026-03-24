const { getGA4Script, trackEvent } = require('../analytics.js');

describe('Analytics Module', () => {
  describe('getGA4Script', () => {
    it('throws error if measurement ID is missing', () => {
      expect(() => getGA4Script()).toThrow('GA4 measurement ID is required');
      expect(() => getGA4Script('')).toThrow('GA4 measurement ID is required');
    });

    it('generates correct GA4 script tags', () => {
      const script = getGA4Script('G-TEST12345');
      expect(script).toContain('https://www.googletagmanager.com/gtag/js?id=G-TEST12345');
      expect(script).toContain("gtag('config', 'G-TEST12345')");
    });
  });

  describe('trackEvent', () => {
    beforeEach(() => {
      window.gtag = jest.fn();
    });

    afterEach(() => {
      delete window.gtag;
    });

    it('does nothing if window or gtag is undefined', () => {
      delete window.gtag;
      expect(() => trackEvent('test_event')).not.toThrow();
    });

    it('calls window.gtag with correct parameters', () => {
      trackEvent('btn_click', { button_name: 'Start' });
      expect(window.gtag).toHaveBeenCalledWith('event', 'btn_click', { button_name: 'Start' });
    });

    it('uses empty object if no params provided', () => {
      trackEvent('page_view');
      expect(global.window.gtag).toHaveBeenCalledWith('event', 'page_view', {});
    });
  });
});
