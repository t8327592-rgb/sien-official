import rehypeSanitize, { defaultSchema, type Options } from "rehype-sanitize";
import type { Root, Element } from "hast";

const prefix = "user-content-";
const schema: Options = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "articlesummary", "keypoints", "proscons", "summarycard"],
  strip: [...(defaultSchema.strip ?? []), "style", "iframe", "object", "embed", "form", "svg", "math"],
  clobberPrefix: prefix,
};

// Run after raw HTML parsing and heading slug generation. The default schema
// strips event handlers, inline styles and unsafe URLs, and prefixes IDs.
export function rehypeArticleSanitize() {
  const sanitize = rehypeSanitize(schema);
  return (tree: Root) => {
    const elements: Element[] = [];
    function collect(node: Root | Element) {
      for (const child of node.children) {
        if (child.type === "element") { elements.push(child); collect(child); }
      }
    }
    collect(tree);
    const targets = new Set(elements.flatMap(node => [node.properties.id, node.properties.name])
      .filter((value): value is string => typeof value === "string"));
    // Keep in-article links/footnotes aligned with the prefixed IDs. The TOC
    // reads rendered IDs directly. Links to targets outside this tree stay intact.
    for (const node of elements) {
      const href = node.properties.href;
      if (node.tagName !== "a" || typeof href !== "string" || !href.startsWith("#")) continue;
      try {
        if (targets.has(decodeURIComponent(href.slice(1)))) node.properties.href = `#${prefix}${href.slice(1)}`;
      } catch { /* Leave malformed fragments for the sanitizer to handle. */ }
    }
    return sanitize(tree);
  };
}
