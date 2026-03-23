/**
 * Google Analytics 4 Integration Helper
 */

/**
 * Generate GA4 tracking script
 * @param {string} measurementId - GA4 measurement ID (G-XXXXXXXXXX)
 * @returns {string} Script tags HTML
 */
function getGA4Script(measurementId) {
  if (!measurementId) {
    throw new Error('GA4 measurement ID is required');
  }
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>`;
}

/**
 * Track a custom event
 * @param {string} eventName
 * @param {Object} params
 */
function trackEvent(eventName, params) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params || {});
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getGA4Script, trackEvent };
}
