/**
 * Comprehensive tests for terraform-snippet-generator
 */
const { RESOURCES, updateResources, updateParams, generateSnippet, copyCode } = require('../app');

const DOM_HTML = `
    <select id="provider">
        <option value="aws">AWS</option>
        <option value="gcp">GCP</option>
        <option value="azure">Azure</option>
    </select>
    <select id="resource-type"></select>
    <div id="params-area"></div>
    <div id="code-output"><code></code></div>
`;

beforeEach(() => {
    document.body.innerHTML = DOM_HTML;
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn() },
        configurable: true
    });
});

describe('Terraform Snippet Generator — Logic', () => {
    test('RESOURCES structure is valid', () => {
        expect(RESOURCES).toHaveProperty('aws');
        expect(RESOURCES).toHaveProperty('gcp');
        expect(RESOURCES).toHaveProperty('azure');
    });

    test('AWS templates produce valid string', () => {
        const ec2 = RESOURCES.aws['EC2 Instance'];
        const res = ec2.template({ name: 'web', ami: 'ami-123', type: 't3', subnet: 'sub' });
        expect(res).toContain('aws_instance');
        expect(res).toContain('web');
    });

    test('S3 template handles versioning branches', () => {
        const s3 = RESOURCES.aws['S3 Bucket'];
        const enabled = s3.template({ name: 'b', versioning: 'true' });
        expect(enabled).toContain('Enabled');
        const disabled = s3.template({ name: 'b', versioning: 'false' });
        expect(disabled).toContain('Disabled');
    });
});

describe('Terraform Snippet Generator — DOM', () => {
    test('updateResources populates select', () => {
        document.getElementById('provider').value = 'gcp';
        updateResources();
        const sel = document.getElementById('resource-type');
        expect(sel.options.length).toBeGreaterThan(0);
        expect(sel.value).toBe('Compute Instance');
    });

    test('updateParams populates inputs', () => {
        document.getElementById('provider').value = 'aws';
        updateResources(); // triggers updateParams
        const area = document.getElementById('params-area');
        expect(area.innerHTML).toContain('Resource Name');
    });

    test('generateSnippet creates full code block', () => {
        document.getElementById('provider').value = 'aws';
        updateResources();
        const code = generateSnippet();
        expect(code).toContain('provider "aws"');
        expect(document.getElementById('code-output').textContent).toContain('provider "aws"');
    });

    test('generateSnippet handles GCP provider block', () => {
        document.getElementById('provider').value = 'gcp';
        updateResources();
        const code = generateSnippet();
        expect(code).toContain('provider "google"');
    });

    test('generateSnippet handles Azure provider block and templates', () => {
        document.getElementById('provider').value = 'azure';
        updateResources();
        const sel = document.getElementById('resource-type');
        sel.value = 'Storage Account';
        updateParams();
        const code = generateSnippet();
        expect(code).toContain('resource "azurerm_storage_account"');
    });

    test('VPC template handles DNS branch', () => {
        const vpc = RESOURCES.aws['VPC'];
        const res = vpc.template({ name: 'v', cidr: '10.0.0.0/16', dns: 'true' });
        expect(res).toContain('enable_dns_support   = true');
    });

    test('Security Group template handles port', () => {
        const sg = RESOURCES.aws['Security Group'];
        const res = sg.template({ name: 's', vpc: 'v', port: '80' });
        expect(res).toContain('from_port   = 80');
    });

    test('copyCode calls clipboard', () => {
        document.getElementById('code-output').querySelector('code').textContent = 'terraform { }';
        copyCode();
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('terraform { }');
    });

    test('copyCode handles null code', () => {
        document.getElementById('code-output').querySelector('code').textContent = '';
        copyCode();
        expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });
});
