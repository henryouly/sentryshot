import { useEffect } from "react";

export default function LiveView() {
  useEffect(() => {
    const SCRIPT_ID = "sentryshot-live-runtime-module";

    // Create a <script type="module"> with the runtime import and call.
    // The string is not parsed by Vite at build time; the browser fetches the module at runtime.
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement("script");
      s.type = "module";
      s.id = SCRIPT_ID;
      s.textContent = `
        import { init } from "/assets/scripts/live.js";
        init();
      `;
      document.body.appendChild(s);
    }

    return () => {
      // Remove the runtime module script on unmount
      const s = document.getElementById(SCRIPT_ID);
      if (s && s.parentElement) s.parentElement.removeChild(s);

      // Cleanup placeholders the module populated (best-effort)
      const grid = document.getElementById("js-content-grid");
      if (grid) grid.replaceChildren();
      const opts = document.getElementById("options-menu");
      if (opts) opts.replaceChildren();
    };
  }, []);

  return (
    <>
      <link rel="preload" href="/assets/scripts/live.js" as="script" />
      <link rel="preload" href="/assets/scripts/libs/common.js" as="script" />
      <link
        rel="preload"
        href="/assets/scripts/components/optionsMenu.js"
        as="script"
      />
      <link
        rel="preload"
        href="/assets/scripts/components/feed.js"
        as="script"
      />
      <link
        rel="preload"
        href="/assets/scripts/components/streamer.js"
        as="script"
      />
      <link rel="preload" href="/assets/scripts/vendor/hls.js" as="script" />
      <link rel="preload" href="/assets/scripts/libs/time.js" as="script" />
      <link
        rel="preload"
        href="/assets/scripts/components/modal.js"
        as="script"
      />

      <div id="content" className="absolute w-full h-full" style={{ boxSizing: "border-box" }}>
        <div className="h-full" style={{ overflowY: "auto" }}>
          <div
            id="js-content-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(var(--gridsize), 1fr)" }}
          ></div>
        </div>
      </div>
    </>
  );
}
