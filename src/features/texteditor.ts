const DRAFT_KEY = 'vantuzfed-editor-draft';

export function textEditorHtml(): string {
  return `
    <div class="editor">
      <div class="editor__toolbar">
        <button type="button" data-editor-new>New</button>
        <button type="button" data-editor-open>Open</button>
        <button type="button" data-editor-save>Save</button>
        <input type="file" accept=".txt,text/plain" data-editor-file class="visually-hidden" />
      </div>
      <textarea class="editor__area" data-editor-area spellcheck="false" placeholder="Начните печатать..."></textarea>
      <div class="editor__status">
        <span data-editor-count>0 words, 0 chars</span>
      </div>
    </div>
  `;
}

export function mountTextEditor(root: HTMLElement) {
  const area = root.querySelector<HTMLTextAreaElement>('[data-editor-area]')!;
  const count = root.querySelector<HTMLElement>('[data-editor-count]')!;
  const fileInput = root.querySelector<HTMLInputElement>('[data-editor-file]')!;

  function updateCount() {
    const text = area.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    count.textContent = `${words} words, ${text.length} chars`;
  }

  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) area.value = saved;
  } catch {
    /* storage unavailable, ignore */
  }
  updateCount();

  area.addEventListener('input', () => {
    updateCount();
    try {
      localStorage.setItem(DRAFT_KEY, area.value);
    } catch {
      /* ignore */
    }
  });

  root.querySelector('[data-editor-new]')?.addEventListener('click', () => {
    if (area.value && !confirm('Очистить текущий текст?')) return;
    area.value = '';
    updateCount();
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  });

  root.querySelector('[data-editor-open]')?.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    area.value = await file.text();
    updateCount();
  });

  root.querySelector('[data-editor-save]')?.addEventListener('click', () => {
    const blob = new Blob([area.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'untitled.txt';
    a.click();
    URL.revokeObjectURL(url);
  });
}
