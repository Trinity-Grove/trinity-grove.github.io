import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const requiredFiles = [
  "index.html",
  "assets/styles.css",
  "assets/site.js",
  "assets/i18n.js",
  "assets/trinity-grove-banner.png",
  "assets/trinity-grove-favicon.png",
  "assets/trinity-grove-family-learning.jpg",
  "assets/aletheia-product-mockup.jpg",
  ".nojekyll",
];

for (const file of requiredFiles) {
  assert.ok(existsSync(join(root, file)), `missing required file: ${file}`);
}

const html = readFileSync(join(root, "index.html"), "utf8");
const css = readFileSync(join(root, "assets/styles.css"), "utf8");

const { translations, resolveLanguage } = await import("./assets/i18n.js");

assert.equal(resolveLanguage("pt", ["en-US"]), "pt", "saved language must win");
assert.equal(resolveLanguage(null, ["es-MX", "en"]), "es", "browser Spanish must be detected");
assert.equal(resolveLanguage(null, ["fr-FR"]), "en", "unsupported languages must fall back to English");

const englishKeys = Object.keys(translations.en).sort();
assert.ok(englishKeys.length >= 50, "the visible site content must be represented in the translation catalog");
for (const locale of ["pt", "es"]) {
  assert.deepEqual(Object.keys(translations[locale]).sort(), englishKeys, `${locale} catalog must be complete`);
}

assert.equal(translations.pt["hero.title"], "Aprender moldado pela <em>verdade, propósito</em> e família.");
assert.equal(translations.es["nav.github"], "Explorar GitHub");
assert.equal(translations.pt["brand.banner_alt"], "Trinity Grove — Aprendizado fiel, cuidadosamente guiado.");
assert.equal(translations.en["hero.verse.ref"], "Proverbs 22:6 · NIV");
assert.equal(translations.pt["hero.verse.ref"], "Provérbios 22:6 · NVI");
assert.equal(translations.es["hero.verse.ref"], "Proverbios 22:6 · NVI");

for (const fragment of [
  "Trinity Grove",
  "Faithful learning, thoughtfully guided.",
  'id="vision"',
  'id="principles"',
  'id="aletheia"',
  'id="ecosystem"',
  'id="contribute"',
  'aria-label="Primary navigation"',
  'href="https://github.com/Trinity-Grove"',
]) {
  assert.ok(html.includes(fragment), `missing required content: ${fragment}`);
}

assert.ok(html.includes('name="description"'), "missing meta description");
assert.ok(html.includes('property="og:title"'), "missing Open Graph title");
assert.ok(html.includes('property="og:image"'), "missing Open Graph image");
assert.ok(html.includes('class="skip-link"'), "missing keyboard skip link");
assert.ok(html.includes('aria-expanded="false"'), "missing accessible mobile navigation state");
assert.ok(html.includes('class="language-switcher"'), "missing language switcher");
assert.ok(html.includes('data-i18n-alt="brand.banner_alt"'), "banner alternative text must be translated");
for (const locale of ["en", "pt", "es"]) {
  assert.ok(html.includes(`data-language="${locale}"`), `missing ${locale} language option`);
}

const brandMarkup = html.match(/<a class="brand"[\s\S]*?<\/a>/)?.[0] ?? "";
assert.ok(brandMarkup.includes('src="assets/trinity-grove-banner.png"'), "header brand must use the Trinity Grove banner");
assert.ok(
  brandMarkup.includes('src="assets/trinity-grove-favicon.png"'),
  "header brand must include the compact mobile favicon"
);
assert.ok(!brandMarkup.includes("<span>"), "header banner must replace the duplicate text label");
assert.ok(!html.includes("Covenant Grove"), "the former brand name must not remain in the page");
assert.ok(!html.includes("github.com/Covenant-Grove"), "links must use the renamed GitHub organization");
assert.ok(!html.includes("covenant-grove.github.io"), "metadata must use the renamed GitHub Pages domain");
assert.ok(html.includes('src="assets/trinity-grove-family-learning.jpg"'), "hero must use the family learning illustration");
assert.ok(html.includes('src="assets/aletheia-product-mockup.jpg"'), "Aletheia section must show the product mockup");
assert.ok(html.includes('loading="lazy"'), "below-the-fold product image must load lazily");
assert.match(css, /\.hero-art>img\{[^}]*height:auto/, "hero image height must scale with its width");
assert.match(css, /\.eyebrow>span:last-child\{[^}]*width:auto[^}]*height:auto/, "translated eyebrow text must keep its natural size");

console.log("site contract: all checks passed");
