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
      <span class="statusbar-text statusbar-number"
        >{{ .status.CPUUsage }}%</span
      >
    </div>
    <div class="statusbar-progressbar">
      <span style="width: {{ .status.CPUUsage }}%"></span>
    </div>
  </li>
  <li>
    <div class="statusbar-text-container">
      <span class="statusbar-text">RAM</span>
      <span class="statusbar-text statusbar-number"
        >{{ .status.RAMUsage }}%</span
      >
    </div>
    <div class="statusbar-progressbar">
      <span style="width: {{ .status.RAMUsage }}%"></span>
    </div>
  </li>
  <li>
    <div class="statusbar-text-container">
      <span class="statusbar-text">DISK</span>
      <span
        style="margin: auto; font-size: 0.35rem"
        class="statusbar-text"
        >{{ .status.DiskUsageFormatted }}</span
      >
      <span class="statusbar-text statusbar-number"
        >{{ .status.DiskUsage }}%</span
      >
    </div>
    <div class="statusbar-progressbar">
      <span style="width: {{ .status.DiskUsage }}%"></span>
    </div>
  </li>
</ul>
