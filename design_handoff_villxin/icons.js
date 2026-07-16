/* villxin — icon set (currentColor). Simple line/glyph marks for the link grids. */
(function () {
  const S = (p, children, fill) =>
    React.createElement(
      "svg",
      Object.assign(
        { viewBox: "0 0 24 24", width: "100%", height: "100%", fill: fill ? "currentColor" : "none",
          stroke: fill ? "none" : "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" },
        p
      ),
      children
    );
  const P = (d, extra) => React.createElement("path", Object.assign({ d }, extra));
  const C = (cx, cy, r, extra) => React.createElement("circle", Object.assign({ cx, cy, r }, extra));

  const ICONS = {
    /* ---- streaming ---- */
    spotify: (p) => S(p, [
      C(12, 12, 9.2, { key: "c", strokeWidth: 1.4 }),
      P("M7.4 9.6c3-0.8 6.4-0.5 9.1 1.1", { key: 1, strokeWidth: 1.4 }),
      P("M7.8 13c2.5-0.6 5.2-0.3 7.4 0.9", { key: 2, strokeWidth: 1.4 }),
      P("M8.4 16c1.9-0.4 3.9-0.2 5.6 0.7", { key: 3, strokeWidth: 1.4 }),
    ]),
    apple: (p) => S(p, [
      P("M16 7c0 5-3 6-3 10", { key: 1 }),
      C(9.5, 16.5, 2.4, { key: 2 }),
      P("M11.9 16.2V7.3c0-0.5 0.3-0.9 0.8-1L16 5.4", { key: 3 }),
    ]),
    bandcamp: (p) => S(p, [
      P("M4 15.5 8 8.5h12l-4 7z", { key: 1 }),
    ], true),
    youtube: (p) => S(p, [
      React.createElement("rect", { key: 1, x: 3, y: 6.5, width: 18, height: 11, rx: 3 }),
      P("M11 9.6l4 2.4-4 2.4z", { key: 2, fill: "currentColor", stroke: "none" }),
    ]),
    /* ---- social ---- */
    instagram: (p) => S(p, [
      React.createElement("rect", { key: 1, x: 4, y: 4, width: 16, height: 16, rx: 5 }),
      C(12, 12, 3.6, { key: 2 }),
      C(17, 7, 0.6, { key: 3, fill: "currentColor", stroke: "none" }),
    ]),
    x: (p) => S(p, [
      P("M5 5l14 14M19 5L5 19", { key: 1 }),
    ]),
    tiktok: (p) => S(p, [
      P("M14 4c0 4 2.5 5.5 5 5.5", { key: 1 }),
      P("M14 4v10.5a3.8 3.8 0 1 1-3.8-3.8", { key: 2 }),
    ]),
    facebook: (p) => S(p, [
      P("M14.5 8.5H13c-0.8 0-1.5 0.6-1.5 1.5v10", { key: 1 }),
      P("M9.5 12.5h5", { key: 2 }),
    ]),
    discord: (p) => S(p, [
      P("M8 7.5C9.2 7 10.6 6.7 12 6.7s2.8 0.3 4 0.8c2 2 2.8 5 3 8.3-1.3 1-2.7 1.6-4 1.9l-0.9-1.5", { key: 1 }),
      P("M16 16.7c-1.2 0.5-2.6 0.8-4 0.8s-2.8-0.3-4-0.8l-1 1.5c-1.3-0.3-2.7-0.9-4-1.9 0.2-3.3 1-6.3 3-8.3", { key: 2 }),
      C(9.8, 13, 1, { key: 3, fill: "currentColor", stroke: "none" }),
      C(14.2, 13, 1, { key: 4, fill: "currentColor", stroke: "none" }),
    ]),
    /* ---- ui ---- */
    play: (p) => S(p, [P("M8 5.5l11 6.5-11 6.5z", { key: 1, fill: "currentColor", stroke: "none" })]),
    pause: (p) => S(p, [
      React.createElement("rect", { key: 1, x: 7.5, y: 6, width: 3, height: 12, rx: 1, fill: "currentColor", stroke: "none" }),
      React.createElement("rect", { key: 2, x: 13.5, y: 6, width: 3, height: 12, rx: 1, fill: "currentColor", stroke: "none" }),
    ]),
    arrow: (p) => S(p, [P("M5 12h14M13 6l6 6-6 6", { key: 1 })]),
    arrowUp: (p) => S(p, [P("M12 19V5M6 11l6-6 6 6", { key: 1 })]),
    check: (p) => S(p, [P("M5 12.5l4.5 4.5L19 7", { key: 1 })]),
    info: (p) => S(p, [C(12, 12, 8.5, { key: 1 }), P("M12 11v5M12 8h0.01", { key: 2 })]),
    mail: (p) => S(p, [
      React.createElement("rect", { key: 1, x: 3.5, y: 5.5, width: 17, height: 13, rx: 2 }),
      P("M4 7l8 6 8-6", { key: 2 }),
    ]),
    download: (p) => S(p, [P("M12 4v11M7 11l5 5 5-5M5 20h14", { key: 1 })]),
    note: (p) => S(p, [C(8, 17, 2.4, { key: 1 }), C(17, 15, 2.4, { key: 2 }), P("M10.4 17V7l9-1.6V15", { key: 3 })]),
    image: (p) => S(p, [
      React.createElement("rect", { key: 1, x: 4, y: 5, width: 16, height: 14, rx: 2 }),
      C(9, 10, 1.4, { key: 2 }),
      P("M5 17l4.5-4 3 2.5L16 11l3 3", { key: 3 }),
    ]),
    disc: (p) => S(p, [C(12, 12, 8.5, { key: 1 }), C(12, 12, 2, { key: 2 })]),
  };

  window.ICONS = ICONS;
  window.Icon = function Icon({ name, ...p }) {
    const fn = ICONS[name];
    return fn ? fn(p) : null;
  };
})();
