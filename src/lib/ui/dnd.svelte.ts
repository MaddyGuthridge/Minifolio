import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

type DraggableOpts = Omit<Parameters<typeof draggable>[0], 'element'>;
type DroppableOpts = Omit<Parameters<typeof dropTargetForElements>[0], 'element'>;

/** Make an element draggable */
export function drag(node: HTMLElement, options?: DraggableOpts) {
  $effect(() => {
    const cleanup = draggable({ element: node, ...(options ?? {}) });
    return () => cleanup();
  });
}

/** Make an element droppable */
export function drop(node: HTMLElement, options?: DroppableOpts) {
  $effect(() => {
    const cleanup = dropTargetForElements({ element: node, ...(options ?? {}) });
    return () => cleanup();
  });
}

/** Make an element draggable and droppable */
export function dragAndDrop(node: HTMLElement, options?: { drag?: DraggableOpts, drop?: DroppableOpts }) {
  drag(node, options?.drag);
  drop(node, options?.drop);
}
