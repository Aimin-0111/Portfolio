/*
  Projects shown on the site, in order.
  To add one: copy an entry, give it a unique `id`, and pick an `island`
  (keep, pin, voxel, robot, chip, moon or tree; see assets/js/props.js).
  A new island appears in the world automatically, and its page lives at #/work/<id>.

  Fields:
    id       short name used in the link (letters, numbers, dashes)
    title    project name
    kind     what it is, shown as a small label
    year     when
    role     your part in it
    summary  one or two sentences for the overview
    details  paragraphs for the detail page
    tags     a few keywords
    links    buttons on the detail page: { label, url }
*/
export default [
  {
    id: "brasswake",
    title: "Brasswake Reach",
    kind: "Game · Godot",
    year: "2026",
    role: "Solo project · in progress",
    island: "keep",
    summary: "A solo pixel-art RPG with an AI game master.",
    details: [
      "The screen is split between the story (about 40%, with animated words) and an explorable world (about 60%).",
      "The game owns the rules, the dice and the state. The AI only narrates and offers a few limited actions, so it can't cheat or break the world.",
    ],
    tags: ["godot", "ai", "pixel art"],
    links: [{ label: "Code", url: "https://github.com/Aimin-0111/DND-project" }],
  },
  {
    id: "lync",
    title: "Lync",
    kind: "App · Android",
    year: "2026",
    role: "Team project · HackDécouverte hackathon",
    island: "pin",
    summary: "A campus companion: a student network and door-to-door navigation down to the room.",
    details: [
      "Lync has two halves in one Android app. Network is a campus-only social space with a feed, clubs, events and a live friends map.",
      "Maps walks you to a room like a street map, then switches to the indoor floor plan when you enter the building, detects your floor and guides you floor by floor.",
    ],
    tags: ["kotlin", "jetpack compose", "supabase"],
    links: [{ label: "Code", url: "https://github.com/floragel/HackDecouverte2" }],
  },
  {
    id: "pycraft",
    title: "PyCraft",
    kind: "Game · Python",
    year: "2026",
    role: "Team project",
    island: "voxel",
    summary: "A creative-mode block world 4096 blocks high, drawn on the GPU.",
    details: [
      "An endless world with mountain ranges rising more than 3,000 blocks above the sea.",
      "The 3D world is rendered with OpenGL and lit by the sun with shadows, then each frame is turned into Pyxel's 256 colors.",
    ],
    tags: ["python", "opengl", "pyxel"],
    links: [{ label: "Code", url: "https://github.com/alban-pixel/PyCraft" }],
  },
  {
    id: "swerve",
    title: "Swerve drive",
    kind: "Robotics · FRC",
    year: "2026",
    role: "Robotics team",
    island: "robot",
    summary: "Code for a competition robot's swerve drive.",
    details: ["Written with the school robotics team for the FRC season. A full write-up is coming."],
    tags: ["java", "frc"],
    links: [],
  },
  {
    id: "regv8",
    title: "REGv8",
    kind: "Hardware · logic gates",
    year: "2026",
    role: "Solo project",
    island: "chip",
    summary: "A CPU designed from logic gates in Turing Complete.",
    details: ["Built gate by gate, with its own instruction set. A full write-up is coming."],
    tags: ["cpu", "assembly"],
    links: [],
  },
  {
    id: "fly-me-to-the-moon",
    title: "Fly Me to the Moon",
    kind: "Music",
    year: "2026",
    role: "Solo project",
    island: "moon",
    summary: "A piano performance turned into a score a person can actually read.",
    details: ["The performance was transcribed to MIDI, then cleaned up by hand into a readable score."],
    tags: ["midi", "musescore"],
    links: [],
  },
];
