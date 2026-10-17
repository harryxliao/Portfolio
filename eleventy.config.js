export default function (eleventyConfig) {
  // Static files live at the repo root and are copied as-is.
  for (const dir of ["assets", "images", "videos", "upload"]) {
    eleventyConfig.addPassthroughCopy(dir);
  }
  for (const file of ["CNAME", "icon.ico", "robots.txt"]) {
    eleventyConfig.addPassthroughCopy(file);
  }

  return {
    dir: { input: "src", output: "_site" },
    htmlTemplateEngine: "njk",
    templateFormats: ["njk"],
  };
}
