import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

/** Make an element draggable */
export function drag(node: HTMLElement) {
  $effect(() => {
    const cleanup = draggable({ element: node });
    return () => cleanup();
  });
}

/** Make an element droppable */
export function drop(node: HTMLElement) {
  $effect(() => {
    const cleanup = dropTargetForElements({ element: node });
    return () => cleanup();
  });
}

/** Make an element draggable and droppable */
export function dragAndDrop(node: HTMLElement) {
  drag(node);
  drop(node);
}
