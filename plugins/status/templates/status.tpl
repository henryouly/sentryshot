<style>
  #logout {
    margin-bottom: 0;
  }

  .statusbar {
    width: var(--sidebar-width);
    margin-bottom: 0.4rem;
  }
  .statusbar li {
    margin-top: 0.2rem;
  }

  .statusbar-text-container {
    display: flex;
  }
  .statusbar-text {
    padding-right: 0.4rem;
    padding-left: 0.4rem;
    color: var(--color-text);
    font-size: 0.4em;
  }
  .statusbar-number {
    margin-left: auto;
  }
  .statusbar-progressbar {
    height: 0.3rem;
    margin-right: 0.3rem;
    margin-left: 0.3rem;
    padding: 0.05rem;
    background: var(--color0);
    border-radius: 0.2rem;
  }
  .statusbar-progressbar span {
    display: block;
    width: 50%;
    height: 100%;
    background: var(--color1);
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.2rem;
    border-bottom-right-radius: 0.2rem;
    border-bottom-left-radius: 0.5rem;
  }
</style>
<ul class="statusbar">
  <li>
    <div class="statusbar-text-container">
      <span class="statusbar-text">CPU</span>
        <span id="status-cpu-number" class="statusbar-text statusbar-number"
          >0%</span
        >
    </div>
    <div class="statusbar-progressbar">
        <span id="status-cpu-bar" style="width: 0%"></span>
    </div>
  </li>
  <li>
    <div class="statusbar-text-container">
      <span class="statusbar-text">RAM</span>
        <span id="status-ram-number" class="statusbar-text statusbar-number"
          >0%</span
        >
    </div>
    <div class="statusbar-progressbar">
        <span id="status-ram-bar" style="width: 0%"></span>
    </div>
  </li>
  <li>
    <div class="statusbar-text-container">
      <span class="statusbar-text">DISK</span>
      <span
        style="margin: auto; font-size: 0.35rem"
        class="statusbar-text"
        >120G / 160G</span
      >
        <span id="status-disk-number" class="statusbar-text statusbar-number"
          >0%</span
        >
    </div>
    <div class="statusbar-progressbar">
        <span id="status-disk-bar" style="width: 0%"></span>
    </div>
  </li>
</ul>
  <script>
  // Poll /api/status and update the sidebar status bar values.
  async function updateStatus() {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) return;
      const s = await res.json();
      const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      const setWidth = (id, v) => { const el = document.getElementById(id); if (el) el.style && (el.style.width = v + '%'); };

      setText('status-cpu-number', s.cpu_usage + '%');
      setWidth('status-cpu-bar', s.cpu_usage);

      setText('status-ram-number', s.ram_usage + '%');
      setWidth('status-ram-bar', s.ram_usage);

      setText('status-disk-number', s.disk_usage + '%');
      setText('status-disk-formatted', s.disk_usage_formatted);
      setWidth('status-disk-bar', s.disk_usage);
    } catch (e) {
      console.debug('status update failed', e);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateStatus();
    setInterval(updateStatus, 5000);
  });
  </script>
