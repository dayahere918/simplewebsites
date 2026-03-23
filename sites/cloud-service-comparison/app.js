/**
 * Cloud Service Comparison — Core Logic
 */
const SERVICES = [
  { category: 'compute', aws: { name: 'EC2', desc: 'Virtual servers' }, gcp: { name: 'Compute Engine', desc: 'Virtual machines' }, azure: { name: 'Virtual Machines', desc: 'Cloud VMs' }, price: 'From $0.0104/hr' },
  { category: 'compute', aws: { name: 'ECS/EKS', desc: 'Container orchestration' }, gcp: { name: 'GKE', desc: 'Kubernetes Engine' }, azure: { name: 'AKS', desc: 'Kubernetes Service' }, price: 'Free control plane (GKE/AKS)' },
  { category: 'compute', aws: { name: 'Elastic Beanstalk', desc: 'PaaS' }, gcp: { name: 'App Engine', desc: 'PaaS' }, azure: { name: 'App Service', desc: 'PaaS' }, price: 'Free tier available' },
  { category: 'storage', aws: { name: 'S3', desc: 'Object storage' }, gcp: { name: 'Cloud Storage', desc: 'Object storage' }, azure: { name: 'Blob Storage', desc: 'Object storage' }, price: 'From $0.023/GB/mo' },
  { category: 'storage', aws: { name: 'EBS', desc: 'Block storage' }, gcp: { name: 'Persistent Disk', desc: 'Block storage' }, azure: { name: 'Managed Disks', desc: 'Block storage' }, price: 'From $0.04/GB/mo' },
  { category: 'storage', aws: { name: 'EFS', desc: 'File storage' }, gcp: { name: 'Filestore', desc: 'File storage' }, azure: { name: 'Azure Files', desc: 'File storage' }, price: 'From $0.30/GB/mo' },
  { category: 'database', aws: { name: 'RDS', desc: 'Managed SQL' }, gcp: { name: 'Cloud SQL', desc: 'Managed SQL' }, azure: { name: 'Azure SQL', desc: 'Managed SQL' }, price: 'From $0.017/hr' },
  { category: 'database', aws: { name: 'DynamoDB', desc: 'NoSQL' }, gcp: { name: 'Firestore/Bigtable', desc: 'NoSQL' }, azure: { name: 'Cosmos DB', desc: 'Multi-model NoSQL' }, price: 'Free tier available' },
  { category: 'database', aws: { name: 'ElastiCache', desc: 'In-memory cache' }, gcp: { name: 'Memorystore', desc: 'Redis/Memcached' }, azure: { name: 'Azure Cache', desc: 'Redis' }, price: 'From $0.017/hr' },
  { category: 'serverless', aws: { name: 'Lambda', desc: 'Functions' }, gcp: { name: 'Cloud Functions', desc: 'Functions' }, azure: { name: 'Azure Functions', desc: 'Functions' }, price: '1M free/mo' },
  { category: 'serverless', aws: { name: 'API Gateway', desc: 'REST APIs' }, gcp: { name: 'API Gateway', desc: 'REST APIs' }, azure: { name: 'API Management', desc: 'REST APIs' }, price: 'From $3.50/M calls' },
  { category: 'serverless', aws: { name: 'Step Functions', desc: 'Workflow orchestration' }, gcp: { name: 'Workflows', desc: 'Workflow orchestration' }, azure: { name: 'Logic Apps', desc: 'Workflow orchestration' }, price: 'From $0.025/1K transitions' },
  { category: 'networking', aws: { name: 'VPC', desc: 'Virtual network' }, gcp: { name: 'VPC', desc: 'Virtual network' }, azure: { name: 'Virtual Network', desc: 'Virtual network' }, price: 'Free (data transfer charged)' },
  { category: 'networking', aws: { name: 'CloudFront', desc: 'CDN' }, gcp: { name: 'Cloud CDN', desc: 'CDN' }, azure: { name: 'Azure CDN', desc: 'CDN' }, price: 'From $0.085/GB' },
  { category: 'networking', aws: { name: 'Route 53', desc: 'DNS' }, gcp: { name: 'Cloud DNS', desc: 'DNS' }, azure: { name: 'Azure DNS', desc: 'DNS' }, price: 'From $0.50/zone/mo' },
  { category: 'ai', aws: { name: 'SageMaker', desc: 'ML platform' }, gcp: { name: 'Vertex AI', desc: 'ML platform' }, azure: { name: 'Azure ML', desc: 'ML platform' }, price: 'From $0.062/hr' },
  { category: 'ai', aws: { name: 'Rekognition', desc: 'Image analysis' }, gcp: { name: 'Vision AI', desc: 'Image analysis' }, azure: { name: 'Computer Vision', desc: 'Image analysis' }, price: 'Free tier: 5K/mo' },
  { category: 'ai', aws: { name: 'Comprehend', desc: 'NLP' }, gcp: { name: 'Natural Language AI', desc: 'NLP' }, azure: { name: 'Language Service', desc: 'NLP' }, price: 'Free tier: 5K/mo' },
];

let currentFilter = 'all';

function filterCategory(cat) {
  currentFilter = cat;
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('active'); b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
  event?.target?.classList.add('active');
  event?.target?.classList.remove('btn-secondary');
  event?.target?.classList.add('btn-primary');
  renderTable();
}

function renderTable() {
  if (typeof document === 'undefined') return;
  const body = document.getElementById('table-body');
  if (!body) return;
  const filtered = currentFilter === 'all' ? SERVICES : SERVICES.filter(s => s.category === currentFilter);
  body.innerHTML = filtered.map(s =>
    `<tr>
      <td class="cat-cell">${s.category}</td>
      <td><div class="service-name">${s.aws.name}</div><div class="service-desc">${s.aws.desc}</div></td>
      <td><div class="service-name">${s.gcp.name}</div><div class="service-desc">${s.gcp.desc}</div></td>
      <td><div class="service-name">${s.azure.name}</div><div class="service-desc">${s.azure.desc}</div></td>
      <td class="price-cell">${s.price}</td>
    </tr>`
  ).join('');
}

if (typeof document !== 'undefined') { document.addEventListener('DOMContentLoaded', renderTable); }
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SERVICES, filterCategory, renderTable, getCurrentFilter: () => currentFilter, setCurrentFilter: f => { currentFilter = f; } };
}
