/* ============================================================
   CROSSFUZE LIGHTHOUSE — SHARED SHELL
   lighthouse-shell.js
   Version: 1.0 · March 2026
   ============================================================
   Provides: LighthouseShell, LighthouseNav, LighthouseSignalBar,
             useLighthouseData, BRAND
   ============================================================
   Usage in your page script:
     const { LighthouseShell, useLighthouseData, BRAND } = LighthouseShellLib;
   ============================================================ */

const LighthouseShellLib = (function() {

  const { useState, useEffect } = React;

  /* ── BRAND TOKENS (JS mirror of CSS vars) ──────────────────── */
  const BRAND = {
    midnight:     "#040E3D",
    green:        "#8FFFDB",
    teal:         "#71F1F7",
    utilityBlue:  "#2CB0CD",
    purple:       "#6400EC",
    lavender:     "#C0A6FF",
    red:          "#F65275",
    crispGrey:    "#F2F2F4",
    // Maturity levels
    l1: "#F65275",
    l2: "#C0A6FF",
    l3: "#2CB0CD",
    l4: "#71F1F7",
    l5: "#8FFFDB",
    // Bar gradients
    barStandard:     "linear-gradient(to right,#F65275 0%,#F65275 8%,#2CB0CD 30%,#71F1F7 65%,#8FFFDB 100%)",
    barAchievement:  "linear-gradient(to right,#8FFFDB,#71F1F7,#2CB0CD)",
    barGap:          "linear-gradient(to right,#F65275,#2CB0CD,#71F1F7)",
  };

  /* ── DATA FETCH HOOK ────────────────────────────────────────── */
  function useLighthouseData(jsonUrl) {
    const [data,   setData]   = useState(null);
    const [status, setStatus] = useState("loading"); // loading | ok | fallback

    useEffect(()=>{
      if(!jsonUrl) { setStatus("fallback"); return; }
      fetch(jsonUrl)
        .then(r => { if(!r.ok) throw new Error("fetch failed"); return r.json(); })
        .then(d => { setData(d); setStatus("ok"); })
        .catch(() => setStatus("fallback"));
    }, [jsonUrl]);

    // Helper: deep-read a dot-path from data, return fallback if missing
    function rd(path, fallback) {
      if(!data) return fallback;
      return path.split(".").reduce((o,k)=> o&&o[k]!==undefined ? o[k] : undefined, data) ?? fallback;
    }

    return { data, status, rd };
  }

  /* ── LIGHTHOUSE ICON SVG ────────────────────────────────────── */
  function LighthouseIcon({ size=20, color="currentColor" }) {
    return React.createElement("svg", {
      viewBox:"0 0 24 24", width:size, height:size,
      fill:"none", stroke:color, strokeWidth:"1.5",
      strokeLinecap:"round", strokeLinejoin:"round"
    },
      React.createElement("path",  {d:"M9.5 6 L12 2.5 L14.5 6 Z"}),
      React.createElement("rect",  {x:"9.5", y:"6", width:"5", height:"3"}),
      React.createElement("path",  {d:"M9.5 9 L8 20 L16 20 L14.5 9 Z"}),
      React.createElement("line",  {x1:"8.5",  y1:"13", x2:"15.5", y2:"13"}),
      React.createElement("line",  {x1:"8",    y1:"17", x2:"16",   y2:"17"}),
      React.createElement("line",  {x1:"12",   y1:"20", x2:"12",   y2:"22.5"}),
      React.createElement("line",  {x1:"8",    y1:"22.5", x2:"16", y2:"22.5"}),
      React.createElement("line",  {x1:"12",   y1:"2.5", x2:"9",   y2:"0.5"}),
      React.createElement("line",  {x1:"12",   y1:"2.5", x2:"15",  y2:"0.5"}),
      React.createElement("line",  {x1:"12",   y1:"2.5", x2:"12",  y2:"0"})
    );
  }

  /* ── CROSSFUZE LOGO ─────────────────────────────────────────── */
  function CrossfuzeLogo() {
    return React.createElement("div", { className:"flex items-center gap-2.5" },
      React.createElement("svg", {
        viewBox:"0 0 32 32", width:32, height:32, fill:"none"
      },
        React.createElement("path", {
          d:"M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z",
          fill:"none", stroke:"#71F1F7", strokeWidth:"1.5"
        }),
        React.createElement("path", {
          d:"M10 16h12M16 10v12",
          stroke:"#8FFFDB", strokeWidth:"2", strokeLinecap:"round"
        })
      ),
      React.createElement("div", null,
        React.createElement("div", {
          style:{ fontSize:18, fontWeight:700, color:"#fff", lineHeight:1.1, letterSpacing:"-0.02em" }
        }, "Crossfuze"),
        React.createElement("div", {
          style:{ fontSize:9, fontWeight:700, letterSpacing:"0.28em", textTransform:"uppercase", color:"rgba(113,241,247,0.65)" }
        }, "Lighthouse")
      )
    );
  }

  /* ── NAV ────────────────────────────────────────────────────── */
  function LighthouseNav({ currentPage, onNavigate, pages, lighthouseUrl }) {
    // pages: [{ id, label }]
    return React.createElement("div", {
      className:"flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-6"
    },
      React.createElement(CrossfuzeLogo),
      React.createElement("nav", {
        className:"flex flex-wrap items-center gap-2"
      },
        ...(pages||[]).map(({ id, label }) =>
          React.createElement("button", {
            key: id,
            onClick: () => onNavigate(id),
            className: `cx-nav-btn ${currentPage===id ? "cx-nav-btn--active" : ""}`
          }, label)
        ),
        React.createElement("a", {
          href: lighthouseUrl || "https://crossfuze-lighthouse.github.io/ZOOM/",
          className: "cx-nav-btn cx-nav-btn--lighthouse",
          style:{ display:"inline-flex", alignItems:"center", gap:6, textDecoration:"none" }
        },
          React.createElement(LighthouseIcon, { size:16, color:"#040E3D" }),
          "Lighthouse"
        )
      )
    );
  }

  /* ── SIGNAL BAR ─────────────────────────────────────────────── */
  function LighthouseSignalBar({ signals, updatedLabel, dataStatus }) {
    // signals: [{ dot, label, val, vc }]
    return React.createElement("div", { className:"cx-signal-bar" },
      React.createElement("span", {
        style:{ fontSize:9, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)", marginRight:8 }
      }, "AEO Signals"),
      React.createElement("div", { style:{ height:14, width:1, background:"rgba(255,255,255,0.10)", marginRight:4 } }),
      ...(signals||[]).map(({ dot, label, val, vc }) =>
        React.createElement("div", { key:label, className:"cx-signal-pill" },
          React.createElement("span", { style:{ height:6, width:6, borderRadius:"50%", background:dot, flexShrink:0 } }),
          React.createElement("span", { style:{ fontSize:11, color:"rgba(255,255,255,0.40)" } }, label),
          React.createElement("span", { style:{ fontSize:11, fontWeight:700, color:vc } }, val)
        )
      ),
      React.createElement("div", { style:{ marginLeft:"auto" } },
        React.createElement("div", { className:"cx-signal-pill" },
          React.createElement("span", { style:{ fontSize:11, color:"rgba(255,255,255,0.35)" } }, "Updated"),
          React.createElement("span", { style:{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.60)" } },
            `${updatedLabel||"Q1 FY26"}${dataStatus==="fallback"?" (local)":""}`
          )
        )
      )
    );
  }

  /* ── SHELL WRAPPER ──────────────────────────────────────────── */
  function LighthouseShell({ children, currentPage, onNavigate, pages, signals, updatedLabel, dataStatus, showSignalBar=true, lighthouseUrl }) {
    return React.createElement("div", { className:"cx-page-bg" },
      React.createElement("div", { style:{ maxWidth:1280, margin:"0 auto" } },
        React.createElement(LighthouseNav, { currentPage, onNavigate, pages, lighthouseUrl }),
        showSignalBar && React.createElement(LighthouseSignalBar, { signals, updatedLabel, dataStatus }),
        children
      )
    );
  }

  return { LighthouseShell, LighthouseNav, LighthouseSignalBar, LighthouseIcon, useLighthouseData, BRAND };

})();
