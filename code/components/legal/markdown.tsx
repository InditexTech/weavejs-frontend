// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: (p) => <h1 className="text-2xl font-normal mb-5" {...strip(p)} />,
  h2: (p) => <h2 className="text-lg font-medium mt-10 mb-3 text-foreground" {...strip(p)} />,
  h3: (p) => <h3 className="text-base font-medium mt-7 mb-2 text-foreground" {...strip(p)} />,
  p: (p) => <p className="my-3 text-sm leading-7 text-foreground/80" {...strip(p)} />,
  ul: (p) => <ul className="my-3 list-disc pl-6 text-sm leading-7 text-foreground/80 marker:text-muted-foreground" {...strip(p)} />,
  ol: (p) => <ol className="my-3 list-decimal pl-6 text-sm leading-7 text-foreground/80 marker:text-muted-foreground" {...strip(p)} />,
  li: (p) => <li className="my-1" {...strip(p)} />,
  table: (p) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...strip(p)} />
    </div>
  ),
  th: (p) => (
    <th
      className="border border-border px-3 py-2 text-left font-medium bg-muted/40"
      {...strip(p)}
    />
  ),
  td: (p) => <td className="border border-border px-3 py-2 text-foreground/80" {...strip(p)} />,
  a: ({ href, children }) => {
    const external = /^https?:\/\//i.test(href ?? "");
    return (
      <a
        href={href}
        className="underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
};

function strip<T extends { node?: unknown }>(props: T) {
  const { node: _node, ...rest } = props;
  void _node;
  return rest;
}

export function Markdown({ children }: Readonly<{ children: string }>) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
