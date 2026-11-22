/*
  Everything written on the site, apart from projects (see projects.js).
  `stops` is the order of places you fly through while scrolling.
  Each id needs a place in assets/js/world.js (PLACES) and a panel in assets/js/ui.js.
  Work also gets one extra step per project, so you walk past each piece.
*/
export default {
  name: "your-name",
  stops: ["home", "work", "about"],

  home: {
    title: "Things I've built, <em>grown</em> and broken",
    intro: "I'm a student developer making apps, games, robots and small experiments.",
  },

  work: {
    title: "Work",
    intro: "Scroll to walk past each piece, or open one from the list.",
  },

  /* not shown for now: add "notes" back to stops (above) to bring it back */
  notes: {
    title: "Notes",
    intro: "Short write-ups on what broke and why.",
    /* each note: title, a one-line `about`, a date, and a url once it is written */
    items: [
      { title: "How Lync finds your floor from air pressure", about: "Indoor navigation when GPS gives up at the door.", date: "soon", url: "" },
      { title: "Letting an AI narrate without letting it cheat", about: "The game owns the rules and the dice; the AI only tells the story.", date: "soon", url: "" },
      { title: "Painting a 3D world with a Kuwahara filter", about: "How this site turns a 3D scene into brushstrokes.", date: "soon", url: "" },
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
