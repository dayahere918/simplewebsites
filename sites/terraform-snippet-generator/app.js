/**
 * Terraform Snippet Generator — Core Logic
 */
const RESOURCES = {
  aws: {
    'EC2 Instance': { params: [{id:'name',label:'Resource Name',def:'web_server'},{id:'ami',label:'AMI ID',def:'ami-0c55b159cbfafe1f0'},{id:'type',label:'Instance Type',def:'t3.medium'},{id:'subnet',label:'Subnet ID',def:'subnet-abc123'}],
      template: (p) => `resource "aws_instance" "${p.name}" {\n  ami           = "${p.ami}"\n  instance_type = "${p.type}"\n  subnet_id     = "${p.subnet}"\n\n  tags = {\n    Name        = "${p.name}"\n    Environment = "production"\n    ManagedBy   = "terraform"\n  }\n}` },
    'S3 Bucket': { params: [{id:'name',label:'Bucket Name',def:'my-app-bucket'},{id:'acl',label:'ACL',def:'private'},{id:'versioning',label:'Versioning (true/false)',def:'true'}],
      template: (p) => `resource "aws_s3_bucket" "${p.name.replace(/[^a-z0-9_]/g,'_')}" {\n  bucket = "${p.name}"\n\n  tags = {\n    Name        = "${p.name}"\n    Environment = "production"\n  }\n}\n\nresource "aws_s3_bucket_versioning" "${p.name.replace(/[^a-z0-9_]/g,'_')}" {\n  bucket = aws_s3_bucket.${p.name.replace(/[^a-z0-9_]/g,'_')}.id\n  versioning_configuration {\n    status = "${p.versioning === 'true' ? 'Enabled' : 'Disabled'}"\n  }\n}` },
    'VPC': { params: [{id:'name',label:'VPC Name',def:'main-vpc'},{id:'cidr',label:'CIDR Block',def:'10.0.0.0/16'},{id:'dns',label:'Enable DNS Support',def:'true'}],
      template: (p) => `resource "aws_vpc" "${p.name.replace(/[^a-z0-9_]/g,'_')}" {\n  cidr_block           = "${p.cidr}"\n  enable_dns_support   = ${p.dns}\n  enable_dns_hostnames = true\n\n  tags = {\n    Name = "${p.name}"\n  }\n}` },
    'Security Group': { params: [{id:'name',label:'SG Name',def:'web-sg'},{id:'vpc',label:'VPC ID',def:'vpc-abc123'},{id:'port',label:'Ingress Port',def:'443'}],
      template: (p) => `resource "aws_security_group" "${p.name.replace(/[^a-z0-9_]/g,'_')}" {\n  name        = "${p.name}"\n  description = "Security group for ${p.name}"\n  vpc_id      = "${p.vpc}"\n\n  ingress {\n    from_port   = ${p.port}\n    to_port     = ${p.port}\n    protocol    = "tcp"\n    cidr_blocks = ["0.0.0.0/0"]\n  }\n\n  egress {\n    from_port   = 0\n    to_port     = 0\n    protocol    = "-1"\n    cidr_blocks = ["0.0.0.0/0"]\n  }\n}` },
    'RDS Instance': { params: [{id:'name',label:'DB Name',def:'mydb'},{id:'engine',label:'Engine',def:'postgres'},{id:'instance',label:'Instance Class',def:'db.t3.medium'},{id:'storage',label:'Storage (GB)',def:'20'}],
      template: (p) => `resource "aws_db_instance" "${p.name}" {\n  identifier           = "${p.name}"\n  engine               = "${p.engine}"\n  instance_class       = "${p.instance}"\n  allocated_storage    = ${p.storage}\n  db_name              = "${p.name}"\n  username             = "admin"\n  password             = var.db_password\n  skip_final_snapshot  = true\n\n  tags = {\n    Name = "${p.name}"\n  }\n}` },
    'Lambda Function': { params: [{id:'name',label:'Function Name',def:'my-lambda'},{id:'runtime',label:'Runtime',def:'nodejs18.x'},{id:'handler',label:'Handler',def:'index.handler'},{id:'memory',label:'Memory (MB)',def:'256'}],
      template: (p) => `resource "aws_lambda_function" "${p.name.replace(/[^a-z0-9_]/g,'_')}" {\n  function_name = "${p.name}"\n  runtime       = "${p.runtime}"\n  handler       = "${p.handler}"\n  memory_size   = ${p.memory}\n  timeout       = 30\n\n  filename         = "\${path.module}/lambda.zip"\n  source_code_hash = filebase64sha256("\${path.module}/lambda.zip")\n\n  role = aws_iam_role.lambda_role.arn\n\n  environment {\n    variables = {\n      ENV = "production"\n    }\n  }\n}` }
  },
  gcp: {
    'Compute Instance': { params: [{id:'name',label:'Name',def:'web-vm'},{id:'machine',label:'Machine Type',def:'e2-medium'},{id:'zone',label:'Zone',def:'us-central1-a'},{id:'image',label:'Image',def:'debian-cloud/debian-11'}],
      template: (p) => `resource "google_compute_instance" "${p.name.replace(/[^a-z0-9_]/g,'_')}" {\n  name         = "${p.name}"\n  machine_type = "${p.machine}"\n  zone         = "${p.zone}"\n\n  boot_disk {\n    initialize_params {\n      image = "${p.image}"\n    }\n  }\n\n  network_interface {\n    network = "default"\n    access_config {}\n  }\n}` },
    'Cloud Storage': { params: [{id:'name',label:'Bucket Name',def:'my-gcs-bucket'},{id:'location',label:'Location',def:'US'},{id:'class',label:'Storage Class',def:'STANDARD'}],
      template: (p) => `resource "google_storage_bucket" "${p.name.replace(/[^a-z0-9_]/g,'_')}" {\n  name          = "${p.name}"\n  location      = "${p.location}"\n  storage_class = "${p.class}"\n\n  versioning {\n    enabled = true\n  }\n\n  uniform_bucket_level_access = true\n}` },
    'Cloud SQL': { params: [{id:'name',label:'Instance Name',def:'my-sql'},{id:'version',label:'DB Version',def:'POSTGRES_14'},{id:'tier',label:'Tier',def:'db-f1-micro'},{id:'region',label:'Region',def:'us-central1'}],
      template: (p) => `resource "google_sql_database_instance" "${p.name.replace(/[^a-z0-9_]/g,'_')}" {\n  name             = "${p.name}"\n  database_version = "${p.version}"\n  region           = "${p.region}"\n\n  settings {\n    tier = "${p.tier}"\n  }\n\n  deletion_protection = false\n}` }
  },
  azure: {
    'Virtual Machine': { params: [{id:'name',label:'VM Name',def:'web-vm'},{id:'size',label:'VM Size',def:'Standard_B2s'},{id:'location',label:'Location',def:'eastus'},{id:'rg',label:'Resource Group',def:'my-rg'}],
      template: (p) => `resource "azurerm_linux_virtual_machine" "${p.name.replace(/[^a-z0-9_]/g,'_')}" {\n  name                  = "${p.name}"\n  location              = "${p.location}"\n  resource_group_name   = "${p.rg}"\n  size                  = "${p.size}"\n  admin_username        = "adminuser"\n  network_interface_ids = [azurerm_network_interface.example.id]\n\n  os_disk {\n    caching              = "ReadWrite"\n    storage_account_type = "Standard_LRS"\n  }\n\n  source_image_reference {\n    publisher = "Canonical"\n    offer     = "0001-com-ubuntu-server-jammy"\n    sku       = "22_04-lts"\n    version   = "latest"\n  }\n}` },
    'Storage Account': { params: [{id:'name',label:'Account Name',def:'mystorageacct'},{id:'location',label:'Location',def:'eastus'},{id:'rg',label:'Resource Group',def:'my-rg'},{id:'tier',label:'Account Tier',def:'Standard'}],
      template: (p) => `resource "azurerm_storage_account" "${p.name}" {\n  name                     = "${p.name}"\n  resource_group_name      = "${p.rg}"\n  location                 = "${p.location}"\n  account_tier             = "${p.tier}"\n  account_replication_type = "LRS"\n}` }
  }
};

function getProvider() { return typeof document !== 'undefined' ? document.getElementById('provider')?.value || 'aws' : 'aws'; }

function updateResources() {
  if (typeof document === 'undefined') return;
  const provider = getProvider();
  const sel = document.getElementById('resource-type');
  if (!sel) return;
  sel.innerHTML = Object.keys(RESOURCES[provider] || {}).map(r => `<option value="${r}">${r}</option>`).join('');
  updateParams();
}

function updateParams() {
  if (typeof document === 'undefined') return;
  const provider = getProvider();
  const resource = document.getElementById('resource-type')?.value;
  const area = document.getElementById('params-area');
  if (!area || !resource) return;
  const res = RESOURCES[provider]?.[resource];
  if (!res) return;
  area.innerHTML = res.params.map(p =>
    `<div class="form-group"><label class="label">${p.label}</label><input class="input" id="param-${p.id}" value="${p.def}"></div>`
  ).join('');
}

function generateSnippet() {
  if (typeof document === 'undefined') return '';
  const provider = getProvider();
  const resource = document.getElementById('resource-type')?.value;
  const res = RESOURCES[provider]?.[resource];
  if (!res) return '';
  const params = {};
  res.params.forEach(p => { params[p.id] = document.getElementById(`param-${p.id}`)?.value || p.def; });
  const providerBlock = provider === 'aws' ? `provider "aws" {\n  region = "us-east-1"\n}\n\n`
    : provider === 'gcp' ? `provider "google" {\n  project = "my-project"\n  region  = "us-central1"\n}\n\n`
    : `provider "azurerm" {\n  features {}\n}\n\n`;
  const code = providerBlock + res.template(params);
  const output = document.getElementById('code-output');
  if (output) output.querySelector('code').textContent = code;
  return code;
}

function copyCode() {
  const code = document.getElementById('code-output')?.querySelector('code')?.textContent;
  if (code && typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(code);
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => { updateResources(); });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RESOURCES, getProvider, updateResources, updateParams, generateSnippet, copyCode };
}
