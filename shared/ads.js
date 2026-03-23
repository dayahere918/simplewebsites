/**
 * Google AdSense Integration Module
 * Manages ad slot creation and loading with configurable publisher ID.
 */

const AD_CONFIG = {
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', // Replace with your AdSense publisher ID
  adSlots: {
    banner: { format: 'auto', style: 'display:block', fullWidthResponsive: true },
    sidebar: { format: 'auto', style: 'display:block' },
    inArticle: { format: 'fluid', layoutKey: '-fb+5w+4e-db+86', style: 'display:block; text-align:center' }
  }
};

/**
 * Create an ad container element
 * @param {string} slotId - Ad slot ID from AdSense
 * @param {'banner'|'sidebar'|'inArticle'} type - Ad type
 * @param {string} [containerId] - Optional container element ID
 * @returns {string} HTML string for the ad container
 */
function createAdSlot(slotId, type, containerId) {
  if (!slotId) {
    throw new Error('Ad slot ID is required');
  }

  const config = AD_CONFIG.adSlots[type] || AD_CONFIG.adSlots.banner;
  const id = containerId || `ad-${type}-${Date.now()}`;

  return `<div class="ad-container ad-${type}" id="${escapeAttr(id)}">
  <ins class="adsbygoogle"
       style="${config.style}"
       data-ad-client="${AD_CONFIG.publisherId}"
       data-ad-slot="${escapeAttr(slotId)}"
       ${config.fullWidthResponsive ? 'data-full-width-responsive="true"' : ''}
       ${config.format ? `data-ad-format="${config.format}"` : ''}
       ${config.layoutKey ? `data-ad-layout-key="${config.layoutKey}"` : ''}></ins>
</div>`;
}

/**
 * Get the AdSense script tag
 * @returns {string} Script tag HTML
 */
function getAdSenseScript() {
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.publisherId}" crossorigin="anonymous"></script>`;
}

/**
 * Generate ad push script for initializing multiple ad slots
 * @param {number} count - Number of ad slots to push
 * @returns {string} Script HTML
 */
function generateAdPushScript(count) {
  if (typeof count !== 'number' || count < 1) count = 1;
  const pushes = Array.from({ length: count }, () =>
    '(adsbygoogle = window.adsbygoogle || []).push({});'
  ).join('\n    ');
  return `<script>\n    ${pushes}\n</script>`;
}

/**
 * Set the publisher ID
 * @param {string} publisherId
 */
function setPublisherId(publisherId) {
  if (!publisherId || typeof publisherId !== 'string') {
    throw new Error('Valid publisher ID is required');
  }
  AD_CONFIG.publisherId = publisherId;
}

/**
 * Get the current publisher ID
 * @returns {string}
 */
function getPublisherId() {
  return AD_CONFIG.publisherId;
}

function escapeAttr(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createAdSlot, getAdSenseScript, generateAdPushScript, setPublisherId, getPublisherId, AD_CONFIG };
}
