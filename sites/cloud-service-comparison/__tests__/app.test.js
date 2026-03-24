/**
 * @jest-environment jsdom
 */
const { SERVICES, filterCategory, renderTable, getCurrentFilter, setCurrentFilter } = require('../app');

function setupDOM() {
  document.body.innerHTML = `
    <div id="filter-case">
      <button class="filter-btn active" id="btn-all">All</button>
      <button class="filter-btn" id="btn-compute">Compute</button>
      <button class="filter-btn" id="btn-storage">Storage</button>
    </div>
    <table><tbody id="table-body"></tbody></table>
  `;
}

describe('Cloud Service Comparison', () => {
  beforeEach(() => {
    setupDOM();
    setCurrentFilter('all');
    jest.clearAllMocks();
  });

  test('renderTable correctly partitions by category', () => {
    setCurrentFilter('compute');
    renderTable();
    const rows = document.querySelectorAll('#table-body tr');
    const computeServices = SERVICES.filter(s => s.category === 'compute');
    expect(rows.length).toBe(computeServices.length);
  });

  test('filterCategory event handling', () => {
    const btn = document.getElementById('btn-storage');
    global.event = { target: btn };
    filterCategory('storage');
    expect(getCurrentFilter()).toBe('storage');
    expect(btn.classList.contains('active')).toBe(true);
  });

  test('renderTable handles invalid body', () => {
    document.body.innerHTML = '';
    expect(() => renderTable()).not.toThrow();
  });
});
