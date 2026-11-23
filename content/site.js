/*
  Everything written on the site, apart from projects (see projects.js).
  `stops` is the order of places you fly through while scrolling.
  Each id needs a place in assets/js/world.js (PLACES) and a panel in assets/js/ui.js.
  Work also gets one extra step per project, so you walk past each piece.

  The site is in English and French. Any text can be written once (same in both)
  or as { en: "...", fr: "..." }. A missing French text falls back to English.
*/
export default {
  name: "Haiyang Tuo",
  stops: ["home", "work", "about"],

  home: {
    nav: { en: "home", fr: "accueil" },
    title: { en: "Things I've built, <em>grown</em> and broken", fr: "Ce que j'ai construit, <em>fait pousser</em> et cassé" },
    intro: {
      en: "I'm Haiyang, a student who makes apps, games, robots and small experiments.",
      fr: "Je m'appelle Haiyang. Je suis élève et je fais des applis, des jeux, des robots et de petites expériences.",
    },
    cta: { en: "See the work", fr: "Voir les projets" },
  },

  work: {
    title: { en: "Work", fr: "Projets" },
    intro: {
      en: "Scroll to walk past each piece, or open one from the list.",
      fr: "Faites défiler pour passer devant chaque œuvre, ou ouvrez-en une depuis la liste.",
    },
  },

  /* not shown for now: add "notes" back to stops (above) to bring it back */
  notes: {
    title: "Notes",
    intro: { en: "Short write-ups on what broke and why.", fr: "De courts récits de ce qui a cassé, et pourquoi." },
    /* each note: title, a one-line `about`, a date, and a url once it is written */
    items: [
      {
        title: { en: "Turning evacuation plans into a map an app can walk", fr: "Transformer des plans d'évacuation en carte qu'une appli peut parcourir" },
        about: { en: "Photos of seven floors, one coordinate system, 761 points.", fr: "Les photos de sept étages, un seul repère, 761 points." },
        date: { en: "soon", fr: "bientôt" }, url: "",
      },
      {
        title: { en: "Letting an AI narrate without letting it cheat", fr: "Laisser une IA raconter sans la laisser tricher" },
        about: { en: "The game owns the rules and the dice; the AI only tells the story.", fr: "Le jeu garde les règles et les dés ; l'IA ne fait que raconter." },
        date: { en: "soon", fr: "bientôt" }, url: "",
      },
      {
        title: { en: "Painting a 3D world with a Kuwahara filter", fr: "Peindre un monde en 3D avec un filtre de Kuwahara" },
        about: { en: "How this site turns a 3D scene into brushstrokes.", fr: "Comment ce site transforme une scène 3D en coups de pinceau." },
        date: { en: "soon", fr: "bientôt" }, url: "",
      },
    ],
  },

  about: {
    title: { en: "About", fr: "À propos" },
    text: [
      {
        en: "I'm a student who likes building things end to end: Android apps, games, robots and a CPU made of logic gates.",
        fr: "J'aime construire des choses de bout en bout : des applis Android, des jeux, des robots et un processeur fait de portes logiques.",
      },
      {
        en: "I care about things that feel calm to use and are honest about how they work.",
        fr: "Je tiens à ce que ce que je fais soit agréable à utiliser, et honnête sur la façon dont ça marche.",
      },
    ],
    /* short facts, shown as a small list */
    facts: [
      {
        label: { en: "Math", fr: "Maths" },
        text: {
          en: "MATh.en.JEANS research workshop · CEMC contest, top 5 in Quebec · COMC · AMC",
          fr: "Atelier de recherche MATh.en.JEANS · concours CEMC, top 5 au Québec · COMC · AMC",
        },
      },
      { label: { en: "Languages", fr: "Langues" }, text: { en: "French, English, Chinese and Spanish", fr: "Français, anglais, chinois et espagnol" } },
    ],
    contact: [
      { label: "GitHub", url: "https://github.com/Aimin-0111" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/haiyang-tuo-88395544b/" },
      { label: { en: "Email", fr: "Courriel" }, url: "mailto:aimin0111@outlook.com" },
    ],
  },
};
