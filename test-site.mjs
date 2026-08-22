import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const requiredFiles = [
  "index.html",
  "assets/styles.css",
  "assets/site.js",
  "assets/i18n.js",
  "assets/covenant-grove-banner.jpg",
  "assets/favicon.png",
  ".nojekyll",
];

for (const file of requiredFiles) {
  assert.ok(existsSync(join(root, file)), `missing required file: ${file}`);
}

const html = readFileSync(join(root, "index.html"), "utf8");

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
assert.equal(translations.pt["brand.banner_alt"], "Covenant Grove — Aprendizado fiel, cuidadosamente guiado.");

for (const fragment of [
  "Faithful learning, thoughtfully guided.",
  'id="vision"',
  'id="principles"',
  'id="aletheia"',
  'id="ecosystem"',
  'id="contribute"',
  'aria-label="Primary navigation"',
  'href="https://github.com/Covenant-Grove"',
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
assert.ok(
  brandMarkup.includes('src="assets/covenant-grove-banner.jpg"'),
  "header brand must use the horizontal Covenant Grove banner"
);
assert.ok(
  brandMarkup.includes('src="assets/favicon.png"'),
  "header brand must include the compact mobile favicon"
);
assert.ok(!brandMarkup.includes("<span>"), "header banner must replace the duplicate text label");

console.log("site contract: all checks passed");
