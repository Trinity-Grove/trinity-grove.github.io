import { resolveLanguage, translations } from "./i18n.js";

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navigation = document.querySelector(".primary-nav");

const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 16);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

navToggle?.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!open));
  navigation?.classList.toggle("open", !open);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navToggle?.setAttribute("aria-expanded", "false");
    navigation.classList.remove("open");
  });
});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const languageButtons = document.querySelectorAll("[data-language]");

const applyLanguage = (language) => {
  const catalog = translations[language];
  document.documentElement.lang = language;
  document.title = catalog["meta.title"];
  document.querySelector('meta[name="description"]')?.setAttribute("content", catalog["meta.description"]);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", catalog["footer.tagline"]);

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = catalog[node.dataset.i18n];
  });
  document.querySelectorAll("[data-i18n-html]").forEach((node) => {
    node.innerHTML = catalog[node.dataset.i18nHtml];
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", catalog[node.dataset.i18nAria]);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
    node.setAttribute("alt", catalog[node.dataset.i18nAlt]);
  });
  languageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });
  localStorage.setItem("covenant-grove-language", language);
};

const initialLanguage = resolveLanguage(
  localStorage.getItem("covenant-grove-language"),
  navigator.languages ?? [navigator.language]
);
applyLanguage(initialLanguage);

languageButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.language));
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion || !("IntersectionObserver" in window)) {
  document.querySelectorAll(".reveal").forEach((node) => node.classList.add("visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
}
