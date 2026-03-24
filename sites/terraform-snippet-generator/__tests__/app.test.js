/**
 * @jest-environment jsdom
 */
const { 
  RESOURCES, updateResources, updateParams, generateSnippet, copyCode
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <select id="provider">
      <option value="aws">AWS</option>
      <option value="gcp">GCP</option>
      <option value="azure">Azure</option>
    </select>
    <select id="resource-type"></select>
    <div id="params-area"></div>
    <div id="code-output"><code></code></div>
  `;
}

// Mock Navigator Clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined)
  }
});

describe('Terraform Snippet Generator - Exhaustive', () => {
  beforeEach(() => {
    setupDOM();
    updateResources();
    jest.clearAllMocks();
  });

  test('All resource templates for all providers', () => {
    const providerDropdown = document.getElementById('provider');
    const resourceDropdown = document.getElementById('resource-type');

    Object.keys(RESOURCES).forEach(provider => {
      providerDropdown.value = provider;
      updateResources();

      Object.keys(RESOURCES[provider]).forEach(resource => {
        resourceDropdown.value = resource;
        updateParams();
        
        // Test with default values
        const code = generateSnippet();
        expect(code).toContain('resource "');
        expect(code).toContain('provider "');

        // Test with custom values for specific edge cases (like S3 versioning)
        if (resource === 'S3 Bucket') {
          const versioningInput = document.getElementById('param-versioning');
          if (versioningInput) {
            versioningInput.value = 'false';
            const disabledCode = generateSnippet();
            expect(disabledCode).toContain('status = "Disabled"');
          }
        }
      });
    });
  });

  test('copyCode uses clipboard', () => {
    generateSnippet();
    copyCode();
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
