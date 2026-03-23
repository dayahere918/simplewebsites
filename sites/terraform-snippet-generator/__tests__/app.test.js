const { RESOURCES, generateSnippet } = require('../app');

describe('Terraform Snippet Generator', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <select id="provider"><option value="aws">AWS</option></select>
      <select id="resource-type"><option value="EC2 Instance">EC2 Instance</option></select>
      <div id="params-area"></div>
      <pre id="code-output"><code></code></pre>
    `;
  });

  test('RESOURCES contains major providers', () => {
    expect(RESOURCES).toHaveProperty('aws');
    expect(RESOURCES).toHaveProperty('gcp');
    expect(RESOURCES).toHaveProperty('azure');
  });

  test('generateSnippet produces valid HCL string', () => {
    const code = generateSnippet();
    expect(code).toContain('provider "aws"');
    expect(code).toContain('resource "aws_instance"');
  });
});
