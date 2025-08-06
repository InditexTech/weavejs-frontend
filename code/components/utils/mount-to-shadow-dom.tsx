import ReactDOM from "react-dom/client";
import React from "react";

export function mountToShadowDom(Component: React.FC, hostId: string) {
  const hostEl = document.getElementById(hostId);
  if (!hostEl) return;

  const shadowRoot = hostEl.attachShadow({ mode: "open" });

  const mountEl = document.createElement("div");
  mountEl.id = "shadow-parent";
  mountEl.className = "w-full h-full";
  shadowRoot.appendChild(mountEl);

  const styleTags = document.querySelectorAll('style, link[rel="stylesheet"]');

  styleTags.forEach((tag) => {
    const clone = tag.cloneNode(true);
    shadowRoot.appendChild(clone);
  });

  const root = ReactDOM.createRoot(mountEl);
  root.render(<Component />);
}
