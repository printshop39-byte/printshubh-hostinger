/**
 * The mobile menu and the search overlay are both modal dialogs inside the header.
 * Only one may be open at a time: if both were, the search overlay would sit behind the
 * menu sheet and two scroll locks would be stacked. Each one announces when it opens and
 * closes itself when the other one does (same window-event idea as inquiry-form-bus.ts).
 */
export type OverlayKind = "menu" | "search";

const EVENT = "ps:overlay-open";

/** Tell the other overlay that this one is opening. */
export function announceOverlay(kind: OverlayKind): void {
  window.dispatchEvent(new CustomEvent<OverlayKind>(EVENT, { detail: kind }));
}

/** Run `close` when the OTHER overlay opens. Returns the unsubscribe function. */
export function closeWhenOtherOpens(self: OverlayKind, close: () => void): () => void {
  const onOpen = (e: Event) => {
    if ((e as CustomEvent<OverlayKind>).detail !== self) close();
  };
  window.addEventListener(EVENT, onOpen);
  return () => window.removeEventListener(EVENT, onOpen);
}
