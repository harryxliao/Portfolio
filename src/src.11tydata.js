// Every page in src/ is rendered once per language:
//   en -> /<slug>      zh -> /zh/<slug>
// Templates set `slug` (and optionally `navKey`); inside templates use
//   {% if zh %}中文{% else %}English{% endif %}   for translated text
//   {{ L }}/about                                for internal links (adds /zh when needed)
const prefix = (lang) => (lang === "zh" ? "/zh" : "");
const toUrl = (lang, slug = "") => `${prefix(lang)}/${slug}`;

export default {
  layout: null,
  pagination: {
    data: "site.langs",
    size: 1,
    alias: "lang",
    addAllPagesToCollections: true,
  },
  permalink: (data) => {
    const slug = data.slug || "";
    const out = toUrl(data.lang, slug);
    return out.endsWith("/") ? `${out}index.html` : out;
  },
  eleventyComputed: {
    zh: (data) => data.lang === "zh",
    L: (data) => prefix(data.lang),
    urls: (data) => ({ en: toUrl("en", data.slug), zh: toUrl("zh", data.slug) }),
  },
};
