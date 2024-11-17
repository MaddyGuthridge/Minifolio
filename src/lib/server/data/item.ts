/**
 * An item represents an entry within the portfolio.
 *
 * This file contains type definitions and helper functions for accessing and modifying items.
 */

import { array, nullable, string, type } from 'superstruct';
import { ItemIdStruct } from './itemId';

/** Information about an item, stored in its `info.json` */
export const ItemInfoStruct = type({
  /**
   * The name of the item, displayed in the navigator when on this page, as well as on Card
   * elements.
   */
  name: string(),
  /**
   * A shortened name of the item, displayed in the navigator when on a child page, as well as on
   * Chip elements.
   */
  shortName: nullable(string()),
  /**
   * A short description to use for this item. This is shown on Card elements, and as a tooltip for
   * Chip elements.
   */
  description: string(),
  /** The icon image to use for this item, as a path relative to this item's root location. */
  icon: nullable(string()),
  /** The banner image to use for this item, as a path relative to this item's root location. */
  banner: nullable(string()),
  /** A hexadecimal color to use for the item. */
  color: string(),
  /**
   * Items to list as children of this item. Items not in this list will be unlisted, but still
   * accessible if their URL is accessed directly.
   */
  children: array(string()),
  /** Array of item IDs whose children should be used as filters for children of this item. */
  filters: array(ItemIdStruct),
  /** SEO properties, placed in the document `<head>` to improve placement in search engines. */
  seo: type({
    /**
     * A description of the page, presented to search engines. If null, a simple template is
     * generated based on the template of a parent.
     */
    description: nullable(string()),
    /**
     * Keywords to use for the group. These are presented to search engines for this item, and for
     * its children.
     */
    keywords: array(string()),
  }),
});
