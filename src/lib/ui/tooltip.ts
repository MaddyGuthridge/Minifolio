/**
 * Add tooltip to an element using Tippy
 *
 * Source: https://learn.svelte.dev/tutorial/adding-parameters-to-actions
 */
import tippy, { type Props } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light-border.css';

const defaultOptions = {
  theme: 'light-border',
};

/** Add a tooltip to an element */
export default function tooltip(node: Element, options: Partial<Props> | undefined) {
  const tooltip = tippy(node, { ...defaultOptions, ...options });

  return {
    update(options: Partial<Props>) {
      tooltip.setProps(options);
    },
    destroy() {
      tooltip.destroy();
    }
  };
}
