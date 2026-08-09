/**
 * rehype-figscroll — wrap wide block content in a horizontal scroll container.
 *
 * Article diagrams are authored at 560-900 viewBox units. Styled with
 * `width: 100%` they scale DOWN on a phone rather than scrolling, so an
 * 820-unit figure in ~290px of content renders its 11px labels at ~3.5px. The
 * fix is a scroller plus a min-width floor (see .figscroll in newspaper.css);
 * this plugin injects the wrapper at build time so no content file changes.
 *
 * What it wraps:
 *   figure > svg   the diagram only — <figcaption> stays OUTSIDE the scroller,
 *                  so the caption never scrolls away from its figure.
 *   table          which had no styles at all and would otherwise push the page
 *                  sideways the first time anyone authors one.
 *
 * Skipped:
 *   - anything already wrapped (idempotent, so re-running is safe)
 *   - KaTeX's own <svg> output (radicals, matrix brackets), which is inline and
 *     handled by the .katex rules
 *
 * tabindex="0" is required, not decorative: WCAG needs a scrollable region to
 * be reachable and operable by keyboard.
 */

const WRAP_CLASS = 'figscroll';

/** Depth-first walk, visiting parents so children can be replaced in place. */
function walk(node, visit) {
  if (!node || !Array.isArray(node.children)) return;
  visit(node);
  for (const child of node.children) walk(child, visit);
}

const isElement = (n, tag) => n && n.type === 'element' && n.tagName === tag;

const hasClass = (n, cls) => {
  const c = n?.properties?.className;
  return Array.isArray(c) ? c.includes(cls) : c === cls;
};

/** KaTeX emits inline <svg> for radicals and brackets — never wrap those. */
const isKatexSvg = (n) => {
  const c = n?.properties?.className;
  const list = Array.isArray(c) ? c : c ? [c] : [];
  return list.some((x) => typeof x === 'string' && x.startsWith('katex'));
};

function wrap(child) {
  return {
    type: 'element',
    tagName: 'div',
    properties: {
      className: [WRAP_CLASS],
      tabIndex: 0,
      role: 'group',
    },
    children: [child],
  };
}

export default function rehypeFigscroll() {
  return (tree) => {
    walk(tree, (parent) => {
      // Already a wrapper — leave its subtree alone (idempotency).
      if (hasClass(parent, WRAP_CLASS)) return;

      parent.children = parent.children.map((child) => {
        if (isElement(parent, 'figure') && isElement(child, 'svg') && !isKatexSvg(child)) {
          return wrap(child);
        }
        if (isElement(child, 'table')) {
          return wrap(child);
        }
        return child;
      });
    });
  };
}
