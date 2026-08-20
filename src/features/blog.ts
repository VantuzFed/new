export function blogMockupHtml(): string {
  return `
    <div class="blog-mock">
      <div class="blog-mock__skeleton">
        <div class="blog-mock__header">
          <div class="blog-mock__logo"></div>
          <div class="blog-mock__nav"><span></span><span></span><span></span></div>
        </div>
        <div class="blog-mock__hero"></div>
        <div class="blog-mock__cards">
          <div class="blog-mock__card"><div class="blog-mock__thumb"></div><div class="blog-mock__line"></div><div class="blog-mock__line blog-mock__line--short"></div></div>
          <div class="blog-mock__card"><div class="blog-mock__thumb"></div><div class="blog-mock__line"></div><div class="blog-mock__line blog-mock__line--short"></div></div>
          <div class="blog-mock__card"><div class="blog-mock__thumb"></div><div class="blog-mock__line"></div><div class="blog-mock__line blog-mock__line--short"></div></div>
        </div>
      </div>
      <div class="blog-mock__tape blog-mock__tape--1"><span>UNDER CONSTRUCTION</span><span>UNDER CONSTRUCTION</span><span>UNDER CONSTRUCTION</span></div>
      <div class="blog-mock__tape blog-mock__tape--2"><span>UNDER CONSTRUCTION</span><span>UNDER CONSTRUCTION</span><span>UNDER CONSTRUCTION</span></div>
      <div class="blog-mock__note">Блог подключается к CMS API \u2014 скоро здесь будут настоящие посты.</div>
    </div>
  `;
}
