/*
  Everything written on the site, apart from projects (see projects.js).
  `stops` is the order of places you fly through while scrolling.
  Each id needs a place in assets/js/world.js (PLACES) and a panel in assets/js/ui.js.
*/
export default {
  name: "your-name",
  stops: ["home", "work", "notes", "about"],

  home: {
    title: "Things I've built, <em>grown</em> and broken",
    intro: "I'm a student developer making apps, games, robots and small experiments.",
  },

  work: {
    title: "Work",
    intro: "Open a project for the full story.",
  },

  notes: {
    title: "Notes",
    intro: "Short write-ups on what broke and why.",
    items: [
      { title: "How Lync finds your floor from air pressure", date: "soon", url: "" },
      { title: "Letting an AI narrate without letting it cheat", date: "soon", url: "" },
      { title: "Painting a 3D world with a Kuwahara filter", date: "soon", url: "" },
    ],
  },

  about: {
    title: "About",
    text: [
      "I'm a student who likes building things end to end: Android apps, games, robots and the odd CPU.",
      "I care about things that feel calm to use and are honest about how they work.",
    ],
    contact: [
      { label: "GitHub", url: "https://github.com/Aimin-0111" },
      { label: "Email", url: "mailto:hello@example.com" },
    ],
  },
};
