// Client-side interactions for DevOps Demo Hub

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const statusBadge = document.getElementById('server-status-badge');
  const statusText = document.getElementById('status-text');
  const uptimeVal = document.getElementById('uptime-val');
  const memoryVal = document.getElementById('memory-val');
  const memorySub = document.getElementById('memory-sub');
  const nodeVerVal = document.getElementById('node-ver-val');
  const platformVal = document.getElementById('platform-val');
  const envVal = document.getElementById('env-val');
  
  const responseOutput = document.getElementById('response-output');
  const responseStatus = document.getElementById('response-status');
  const responseTime = document.getElementById('response-time');
  const copyBtn = document.getElementById('copy-response-btn');
  
  const itemsList = document.getElementById('items-list');
  const itemCountBadge = document.getElementById('item-count-badge');
  const addItemForm = document.getElementById('add-item-form');
  const newItemTitle = document.getElementById('new-item-title');
  const newItemCategory = document.getElementById('new-item-category');
  const refreshAllBtn = document.getElementById('refresh-all-btn');

  // Format seconds into readable string (e.g. "12m 45s")
  function formatUptime(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds)) return '--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }

  // Fetch health check & update metric cards
  async function fetchHealth() {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      // Update badge
      statusBadge.className = 'status-badge online';
      statusText.textContent = 'Server Online';

      // Update metric cards
      uptimeVal.textContent = formatUptime(data.uptimeSeconds);
      memoryVal.textContent = `${data.processMemory.heapUsedMB} MB`;
      memorySub.textContent = `RSS: ${data.processMemory.rssMB} MB / Heap: ${data.processMemory.heapTotalMB} MB`;
      nodeVerVal.textContent = data.system.nodeVersion;
      platformVal.textContent = `${data.system.platform} (${data.system.freeMemMB}MB free)`;
      envVal.textContent = data.environment;
      
      return data;
    } catch (err) {
      statusBadge.className = 'status-badge offline';
      statusText.textContent = 'Offline / Error';
      console.error('Failed to fetch health:', err);
    }
  }

  // Generic API request executor with latency measurement
  async function executeApiRequest(endpoint, method = 'GET', body = null) {
    const startTime = performance.now();
    responseStatus.textContent = 'Fetching...';
    responseStatus.style.color = '#f59e0b';
    responseTime.textContent = '-- ms';

    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      if (body) {
        options.body = JSON.stringify(body);
      }

      const res = await fetch(endpoint, options);
      const duration = Math.round(performance.now() - startTime);
      const data = await res.json();

      responseStatus.textContent = `${res.status} ${res.statusText || (res.ok ? 'OK' : 'Error')}`;
      responseStatus.style.color = res.ok ? '#10b981' : '#ef4444';
      responseTime.textContent = `${duration} ms`;
      responseOutput.textContent = JSON.stringify(data, null, 2);

      return data;
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      responseStatus.textContent = 'Network Error';
      responseStatus.style.color = '#ef4444';
      responseTime.textContent = `${duration} ms`;
      responseOutput.textContent = JSON.stringify({ error: err.message }, null, 2);
    }
  }

  // Load items from API
  async function loadItems() {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      renderItems(data.items || []);
    } catch (err) {
      itemsList.innerHTML = `<div class="loading-spinner" style="color: #ef4444">Failed to load tasks: ${err.message}</div>`;
    }
  }

  // Render items to DOM
  function renderItems(items) {
    itemCountBadge.textContent = `${items.length} ${items.length === 1 ? 'task' : 'tasks'}`;

    if (items.length === 0) {
      itemsList.innerHTML = '<div class="loading-spinner">No tasks yet. Add one above!</div>';
      return;
    }

    itemsList.innerHTML = items.map(item => `
      <div class="item-card" data-id="${item.id}">
        <div class="item-content">
          <span class="item-badge ${escapeHtml(item.category)}">${escapeHtml(item.category)}</span>
          <span class="item-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</span>
        </div>
        <button class="btn-delete" data-id="${item.id}" title="Delete task">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `).join('');

    // Attach delete listeners
    itemsList.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.getAttribute('data-id');
        await deleteItem(id);
      });
    });
  }

  // Add Item
  async function addItem(title, category) {
    const data = await executeApiRequest('/api/items', 'POST', { title, category });
    if (data && data.item) {
      newItemTitle.value = '';
      await loadItems();
    }
  }

  // Delete Item
  async function deleteItem(id) {
    const data = await executeApiRequest(`/api/items/${id}`, 'DELETE');
    if (data) {
      await loadItems();
    }
  }

  // Helper escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // API trigger buttons
  document.querySelectorAll('.btn-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const endpoint = btn.getAttribute('data-endpoint');
      const method = btn.getAttribute('data-method') || 'GET';
      executeApiRequest(endpoint, method);
    });
  });

  // Form submit
  addItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = newItemTitle.value.trim();
    const category = newItemCategory.value;
    if (title) {
      await addItem(title, category);
    }
  });

  // Copy JSON button
  copyBtn.addEventListener('click', async () => {
    const text = responseOutput.textContent;
    try {
      await navigator.clipboard.writeText(text);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = originalText; }, 1800);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  });

  // Refresh all button
  refreshAllBtn.addEventListener('click', async () => {
    refreshAllBtn.style.opacity = '0.5';
    await Promise.all([fetchHealth(), loadItems()]);
    refreshAllBtn.style.opacity = '1';
  });

  // Initialize
  fetchHealth();
  loadItems();

  // Periodically refresh health metrics every 10 seconds
  setInterval(fetchHealth, 10000);
});
