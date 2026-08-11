/** Lightweight pointer-based dragging for desktop windows (replacement for jQuery UI draggable). */
export function makeDraggable(win: HTMLElement, handle: HTMLElement, container: HTMLElement) {
  let startX = 0;
  let startY = 0;
  let origX = 0;
  let origY = 0;
  let dragging = false;

  handle.addEventListener('pointerdown', (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('.title-bar-controls')) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = win.getBoundingClientRect();
    const parentRect = container.getBoundingClientRect();
    origX = rect.left - parentRect.left;
    origY = rect.top - parentRect.top;
    handle.setPointerCapture(e.pointerId);
    win.style.transition = 'none';
  });

  handle.addEventListener('pointermove', (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const parentRect = container.getBoundingClientRect();
    let nx = origX + dx;
    let ny = origY + dy;
    nx = Math.max(-win.offsetWidth + 80, Math.min(nx, parentRect.width - 80));
    ny = Math.max(0, Math.min(ny, parentRect.height - 32));
    win.style.left = `${nx}px`;
    win.style.top = `${ny}px`;
  });

  const stop = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    try {
      handle.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  handle.addEventListener('pointerup', stop);
  handle.addEventListener('pointercancel', stop);
}
