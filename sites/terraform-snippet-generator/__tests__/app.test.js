/**
 * @jest-environment jsdom
 */
const { 
  RESOURCES, updateResources, updateParams, generateSnippet 
} = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <select id="provider"><option value="aws">AWS</option><option value="gcp">GCP</option></select>
    <select id="resource-type"></select>
    <div id="params-area"></div>
    <div id="code-output"><code></code></div>
  `;
}

describe('Terraform Snippet Generator', () => {
  beforeEach(() => {
    setupDOM();
    updateResources();
  });

  test('updateResources populates resource selector', () => {
    const sel = document.getElementById('resource-type');
    expect(sel.children.length).toBeGreaterThan(0);
    expect(sel.value).toBe('EC2 Instance');
  });

  test('updateParams creates input fields', () => {
    updateParams();
    const area = document.getElementById('params-area');
    expect(area.children.length).toBeGreaterThan(0);
    // Resource 'EC2 Instance' params include 'name', 'ami', etc.
    expect(document.getElementById('param-name')).not.toBeNull();
  });

  test('generateSnippet produces valid HCL block', () => {
    const code = generateSnippet();
    expect(code).toContain('resource "aws_instance"');
    expect(code).toContain('provider "aws"');
  });

  test('switching provider updates resources', () => {
    document.getElementById('provider').value = 'gcp';
    updateResources();
    const sel = document.getElementById('resource-type');
    expect(sel.value).toBe('Compute Instance');
  });
});
