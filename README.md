This is one of Harry's portfolio websites.

## 結構

```
src/                     ← 網頁模板（中英文共用同一份）
  index.njk              首頁
  about.njk / work.njk / contact.njk   這三頁先顯示首頁，再由 about.js 疊上 fragments/
  fragments/             關於 / 作品 / 聯絡 的內容
  work/*.njk             各作品頁
  _includes/layouts/base.njk   共用 <head>、導覽列、頁尾
  _includes/partials/    導覽列、頁尾、首頁內容、主題切換
assets/  images/  videos/  upload/   ← 靜態檔，原樣複製
```

每個模板會自動產生兩個語言版本：`/about/` 和 `/zh/about/`。

- 翻譯文字：`{% if zh %}中文{% else %}English{% endif %}`
- 站內連結：`{{ L }}/work/c-cube.html`（中文版會自動加上 `/zh`）

## 深色 / 淺色主題

顏色定義在 `assets/css/theme.css`。CSS 裡不要再寫死 `#fff`、`#333`，改用：

- `var(--ink)` 文字色、`var(--paper)` 背景色
- `var(--g-33)` 等於深色模式的 `#333`，淺色模式會自動反轉
- 半透明：`rgba(var(--ink-rgb), 0.5)`

疊在影片或照片上的區塊（例如 `.hero-section`）在淺色模式下仍維持深色，清單在 `theme.css` 最上面。

## 開發

```
npm install
npm run dev      # http://localhost:5502
npm run build    # 輸出到 _site/
```

推到 `main` 後，GitHub Actions 會自動建置並部署。
