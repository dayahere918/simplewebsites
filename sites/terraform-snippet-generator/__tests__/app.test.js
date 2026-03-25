/**
 * @jest-environment jsdom
 */
const { 
  RESOURCES, updateResources, updateParams, generateSnippet, copyCode, getProvider
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

  test('GCP Compute Instance generates correct template', () => {
    const providerDropdown = document.getElementById('provider');
    const resourceDropdown = document.getElementById('resource-type');
    providerDropdown.value = 'gcp';
    updateResources();
    resourceDropdown.value = 'Compute Instance';
    updateParams();
    const code = generateSnippet();
    expect(code).toContain('google_compute_instance');
    expect(code).toContain('provider "google"');
  });

  test('GCP Cloud Storage template', () => {
    const providerDropdown = document.getElementById('provider');
    const resourceDropdown = document.getElementById('resource-type');
    providerDropdown.value = 'gcp';
    updateResources();
    resourceDropdown.value = 'Cloud Storage';
    updateParams();
    const code = generateSnippet();
    expect(code).toContain('google_storage_bucket');
  });

  test('GCP Cloud SQL template', () => {
    const providerDropdown = document.getElementById('provider');
    const resourceDropdown = document.getElementById('resource-type');
    providerDropdown.value = 'gcp';
    updateResources();
    resourceDropdown.value = 'Cloud SQL';
    updateParams();
    const code = generateSnippet();
    expect(code).toContain('google_sql_database_instance');
  });

  test('Azure Virtual Machine template', () => {
    const providerDropdown = document.getElementById('provider');
    const resourceDropdown = document.getElementById('resource-type');
    providerDropdown.value = 'azure';
    updateResources();
    resourceDropdown.value = 'Virtual Machine';
    updateParams();
    const code = generateSnippet();
    expect(code).toContain('azurerm_linux_virtual_machine');
    expect(code).toContain('provider "azurerm"');
  });

  test('Azure Storage Account template', () => {
    const providerDropdown = document.getElementById('provider');
    const resourceDropdown = document.getElementById('resource-type');
    providerDropdown.value = 'azure';
    updateResources();
    resourceDropdown.value = 'Storage Account';
    updateParams();
    const code = generateSnippet();
    expect(code).toContain('azurerm_storage_account');
  });

  test('All AWS resource templates', () => {
    const providerDropdown = document.getElementById('provider');
    const resourceDropdown = document.getElementById('resource-type');
    providerDropdown.value = 'aws';
    updateResources();

    ['EC2 Instance', 'VPC', 'Security Group', 'RDS Instance', 'Lambda Function'].forEach(res => {
      resourceDropdown.value = res;
      updateParams();
      const code = generateSnippet();
      expect(code).toContain('provider "aws"');
      expect(code).toContain('resource "');
    });
  });

  test('updateParams with missing resource does nothing', () => {
    const resourceDropdown = document.getElementById('resource-type');
    resourceDropdown.value = 'nonexistent';
    expect(() => updateParams()).not.toThrow();
  });

  test('generateSnippet with missing resource returns empty', () => {
    const resourceDropdown = document.getElementById('resource-type');
    resourceDropdown.value = 'nonexistent';
    const code = generateSnippet();
    expect(code).toBe('');
  });

  test('getProvider returns default for missing element', () => {
    expect(getProvider()).toBeTruthy();
  });
});
