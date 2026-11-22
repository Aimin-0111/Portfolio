/*
  Projects shown on the site, in order. Each one hangs as a framed piece in the Work gallery.
  To add one: copy an entry and give it a unique `id`. Its frame and page appear automatically.

  Fields:
    id       short name used in the link (letters, numbers, dashes)
    title    project name
    kind     what it is, shown as a small label
    year     when
    role     your part in it
    image    optional picture for the frame and the detail page: { src, alt }
             (put the file in content/media; landscape works best)
    island   used when there is no image: a little island scene inside the frame
             (keep, pin, voxel, robot, chip, moon or tree; see assets/js/props.js)
    summary  one or two sentences for the label beside the piece
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
    role: "Lead: code, balance and AI · team of 4",
    image: { src: "content/media/brasswake.jpg", alt: "Brasswake Reach: a pixel-art map on the left and the AI narrator's story on the right" },
    island: "keep",
    summary: "A single-player RPG where an AI dungeon master narrates every turn, beside an animated pixel-art world.",
    details: [
      "The screen is split between the story, told with animated words, and a world you can explore.",
      "The game owns the rules, the dice and the state. The AI only narrates and offers a few limited actions, so it can't cheat or break the world.",
      "It started as a plain JavaScript web page of about 2,550 lines, with dice, a character sheet, quests and a copy-paste AI loop. It now runs in Godot 4, made by a team of four: two programmers, an artist and a writer. Current version: beta 0.4 (November 2026).",
    ],
    tags: ["godot", "gdscript", "ai"],
    links: [{ label: "Code", url: "https://github.com/Aimin-0111/DND-project" }],
  },
  {
    id: "lync",
    title: "Lync",
    kind: "App · Android",
    year: "2026",
    role: "Team project · HackDécouverte hackathon",
    image: { src: "content/media/lync.jpg", alt: "A phone showing Lync's indoor map of a building floor" },
    island: "pin",
    summary: "A campus companion for university students: a student network, and directions to the right room.",
    details: [
      "Lync has two halves in one Android app. Network is a campus-only social space with a feed, clubs, events and a live friends map.",
      "Maps walks you to a room like a street map, then switches to the indoor floor plan when you enter the building, detects your floor and guides you floor by floor. It starts with Concordia's John Molson building: 7 floors and about 300 rooms.",
      "The app is covered by 101 unit tests.",
    ],
    tags: ["kotlin", "jetpack compose", "supabase"],
    links: [{ label: "Code", url: "https://github.com/floragel/HackDecouverte2" }],
  },
  {
    id: "pycraft",
    title: "PyCraft",
    kind: "Game · Python",
    year: "2026",
    role: "Team project · school (NSI)",
    image: { src: "content/media/pycraft.jpg", alt: "A forested hillside of blocks in PyCraft" },
    island: "voxel",
    summary: "A creative-mode block world drawn on the graphics card, with mountains more than 3,000 blocks high.",
    details: [
      "An endless world 4,096 blocks high, with mountain ranges rising more than 3,000 blocks above the sea.",
      "The 3D world is drawn on the graphics card with OpenGL (moderngl) and lit by the sun with shadows. Pyxel handles the window, the menus and the sound.",
    ],
    tags: ["python", "opengl", "pyxel"],
    links: [{ label: "Code", url: "https://github.com/alban-pixel/PyCraft" }],
  },
  {
    id: "stan-robotix",
    title: "Stan Robotix 6622",
    kind: "Robotics · FRC",
    year: "2026",
    role: "Team member · programming",
    image: { src: "content/media/stan-robotix.jpg", alt: "The team's 2024 robot, with 6622 on its blue bumpers, on the competition field" },
    island: "robot",
    summary: "My school's FIRST Robotics Competition team. We write the robot's code in C++.",
    details: [
      "The robot code is written in C++ with WPILib, in the command-based style: one subsystem for each part of the robot, like the drivetrain or the intake, and commands that tell them what to do.",
      "I'm on the programming side: learning the team's C++ through its exercises and working on a swerve-drive practice robot.",
      "Pictured: the team's 2024 robot.",
    ],
    tags: ["c++", "wpilib", "frc"],
    links: [{ label: "Team website", url: "https://stanrobotix6622.com/" }],
  },
  {
    id: "regv8",
    title: "REGv8",
    kind: "Hardware · logic gates",
    year: "2026",
    role: "Solo project",
    island: "chip",
    summary: "A computer designed from logic gates in the game Turing Complete, with its own opcode table.",
    details: ["Built gate by gate, with its own instruction set. A full write-up is coming."],
    tags: ["cpu", "assembly"],
    links: [],
  },
];
