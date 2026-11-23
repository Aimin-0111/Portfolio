/*
  Projects shown on the site, in order. Each one hangs as a framed piece in the Work gallery.
  To add one: copy an entry and give it a unique `id`. Its frame and page appear automatically.
  Text can be written once, or as { en: "...", fr: "..." } (see site.js).

  Fields:
    id       short name used in the link (letters, numbers, dashes)
    title    project name
    kind     what it is, shown as a small label
    year     when
    role     your part in it
    image    optional picture for the frame and the top of the detail page: { src, alt }
             (put the file in content/media; landscape works best)
    gallery  optional extra pictures for the detail page: [{ src, alt }, ...]
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
    kind: { en: "Game · Godot", fr: "Jeu · Godot" },
    year: "2026",
    role: { en: "Lead: code, balance and AI · team of 4", fr: "Responsable code, équilibrage et IA · équipe de 4" },
    image: {
      src: "content/media/brasswake.jpg",
      alt: { en: "Brasswake Reach: a pixel-art map on the left and the AI narrator's story on the right", fr: "Brasswake Reach : une carte en pixel art à gauche et le récit du narrateur IA à droite" },
    },
    island: "keep",
    summary: {
      en: "A single-player RPG where an AI dungeon master narrates every turn, beside an animated pixel-art world.",
      fr: "Un RPG solo où un maître du jeu IA raconte chaque tour, à côté d'un monde animé en pixel art.",
    },
    details: {
      en: [
        "The screen is split between the story, told with animated words, and a world you can explore.",
        "The game owns the rules, the dice and the state. The AI only narrates and offers a few limited actions, so it can't cheat or break the world.",
        "It started as a plain JavaScript web page of about 2,550 lines, with dice, a character sheet, quests and a copy-paste AI loop. It now runs in Godot 4, made by a team of four: two programmers, an artist and a writer. Current version: beta 0.4 (November 2026).",
      ],
      fr: [
        "L'écran est partagé entre l'histoire, racontée avec des mots animés, et un monde à explorer.",
        "Le jeu garde les règles, les dés et l'état de la partie. L'IA ne fait que raconter et proposer quelques actions limitées : elle ne peut ni tricher ni casser le monde.",
        "Tout a commencé par une page web en JavaScript d'environ 2 550 lignes, avec des dés, une fiche de personnage, des quêtes et une boucle d'IA par copier-coller. Le jeu tourne maintenant sous Godot 4, fait par une équipe de quatre : deux programmeurs, un artiste et un scénariste. Version actuelle : bêta 0.4 (novembre 2026).",
      ],
    },
    tags: ["godot", "gdscript", "ai"],
    links: [{ label: { en: "Code", fr: "Code" }, url: "https://github.com/Aimin-0111/DND-project" }],
  },
  {
    id: "lync",
    title: "Lync",
    kind: { en: "App · Android", fr: "Appli · Android" },
    year: "2026",
    role: { en: "Team project · HackDécouverte 2, 2nd place · I made the indoor maps", fr: "Projet d'équipe · HackDécouverte 2, 2e place · j'ai fait les cartes intérieures" },
    image: {
      src: "content/media/lync-maps.jpg",
      alt: { en: "The seven floor plans of the John Molson building, vectorized and stacked on top of each other", fr: "Les sept plans d'étage du bâtiment John Molson, vectorisés et superposés" },
    },
    gallery: [
      { src: "content/media/lync-graph.jpg", alt: { en: "The graph editor: doors, corridors and stairs marked on floor 2", fr: "L'éditeur de graphe : portes, couloirs et escaliers placés sur l'étage 2" } },
      { src: "content/media/lync.jpg", alt: { en: "The app guiding someone to a room on the indoor map", fr: "L'appli qui guide quelqu'un vers une salle sur le plan intérieur" } },
    ],
    island: "pin",
    summary: {
      en: "A campus app for Concordia students, with directions down to the room. My part: the indoor maps it walks you through.",
      fr: "Une appli de campus pour les étudiants de Concordia, qui guide jusqu'à la salle. Ma partie : les cartes intérieures.",
    },
    details: {
      en: [
        "Lync has two halves in one Android app: a campus-only social network, and Maps, which walks you to a room like a street map, switches to the indoor plan when you enter the building, finds your floor from air pressure and guides you floor by floor.",
        "My part was the maps. Concordia doesn't publish detailed floor plans, so we photographed the evacuation plan on each floor of the John Molson building. I turned the photos into clean vector plans and aligned all seven floors in one metric frame, centred on the six central elevators and scaled from OpenStreetMap.",
        "Then I built a small web editor to draw the navigation graph on top: each room is a single point at its door, linked through corridors, stairs and elevators. The finished graph has 761 points and about 300 rooms, and the app finds the shortest route on it, with a step-free option.",
      ],
      fr: [
        "Lync réunit deux parties dans une appli Android : un réseau social réservé au campus, et Maps, qui vous mène à une salle comme une carte routière, passe au plan intérieur quand vous entrez dans le bâtiment, trouve votre étage grâce à la pression de l'air et vous guide étage par étage.",
        "Ma partie, c'était les cartes. Concordia ne publie pas de plans détaillés, alors nous avons photographié le plan d'évacuation de chaque étage du bâtiment John Molson. J'ai transformé ces photos en plans vectoriels propres et aligné les sept étages dans un même repère en mètres, centré sur les six ascenseurs du milieu et mis à l'échelle avec OpenStreetMap.",
        "Ensuite, j'ai construit un petit éditeur web pour tracer le graphe de navigation par-dessus : chaque salle est un seul point, sa porte, relié par les couloirs, les escaliers et les ascenseurs. Le graphe final compte 761 points et environ 300 salles, et l'appli y calcule le chemin le plus court, avec une option sans marches.",
      ],
    },
    tags: ["svg", "python", "kotlin", "graphs"],
    links: [
      { label: { en: "Case study", fr: "Étude de cas" }, url: "https://nayl.ca/projets/lync.html" },
      { label: { en: "Code", fr: "Code" }, url: "https://github.com/floragel/HackDecouverte2" },
    ],
  },
  {
    id: "pycraft",
    title: "PyCraft",
    kind: { en: "Game · Python", fr: "Jeu · Python" },
    year: "2026",
    role: { en: "Team project · NSI class", fr: "Projet d'équipe · cours de NSI" },
    image: { src: "content/media/pycraft.jpg", alt: { en: "A forested hillside of blocks in PyCraft", fr: "Une colline boisée faite de blocs dans PyCraft" } },
    island: "voxel",
    summary: {
      en: "A creative-mode block world drawn on the graphics card, with mountains more than 3,000 blocks high.",
      fr: "Un monde de blocs en mode créatif, dessiné par la carte graphique, avec des montagnes de plus de 3 000 blocs de haut.",
    },
    details: {
      en: [
        "An endless world 4,096 blocks high, with mountain ranges rising more than 3,000 blocks above the sea.",
        "The 3D world is drawn on the graphics card with OpenGL (moderngl) and lit by the sun with shadows. Pyxel handles the window, the menus and the sound.",
      ],
      fr: [
        "Un monde sans fin de 4 096 blocs de haut, avec des chaînes de montagnes qui montent à plus de 3 000 blocs au-dessus de la mer.",
        "Le monde 3D est dessiné par la carte graphique avec OpenGL (moderngl) et éclairé par le soleil, avec des ombres. Pyxel gère la fenêtre, les menus et le son.",
      ],
    },
    tags: ["python", "opengl", "pyxel"],
    links: [{ label: { en: "Code", fr: "Code" }, url: "https://github.com/alban-pixel/PyCraft" }],
  },
  {
    id: "stan-robotix",
    title: "Stan Robotix 6622",
    kind: { en: "Robotics · FRC", fr: "Robotique · FRC" },
    year: "2026",
    role: { en: "Team member · programming", fr: "Membre de l'équipe · programmation" },
    image: {
      src: "content/media/stan-robotix.jpg",
      alt: { en: "The team's 2024 robot, with 6622 on its blue bumpers, on the competition field", fr: "Le robot 2024 de l'équipe, avec 6622 sur ses pare-chocs bleus, sur le terrain de compétition" },
    },
    island: "robot",
    summary: {
      en: "My school's FIRST Robotics Competition team. We write the robot's code in C++.",
      fr: "L'équipe FIRST Robotics Competition de mon école. Nous écrivons le code du robot en C++.",
    },
    details: {
      en: [
        "The robot code is written in C++ with WPILib, in the command-based style: one subsystem for each part of the robot, like the drivetrain or the intake, and commands that tell them what to do.",
        "I'm on the programming side: learning the team's C++ through its exercises and working on a swerve-drive practice robot.",
        "Pictured: the team's 2024 robot.",
      ],
      fr: [
        "Le code du robot est écrit en C++ avec WPILib, en style « command-based » : un sous-système pour chaque partie du robot, comme la base roulante ou le ramasseur, et des commandes qui leur disent quoi faire.",
        "Je suis du côté programmation : j'apprends le C++ de l'équipe avec ses exercices et je travaille sur un robot d'entraînement à propulsion swerve.",
        "Sur la photo : le robot 2024 de l'équipe.",
      ],
    },
    tags: ["c++", "wpilib", "frc"],
    links: [{ label: { en: "Team website", fr: "Site de l'équipe" }, url: "https://stanrobotix6622.com/" }],
  },
  {
    id: "regv8",
    title: "REGv8",
    kind: { en: "Hardware · logic gates", fr: "Matériel · portes logiques" },
    year: "2026",
    role: { en: "Solo project · just started", fr: "Projet solo · tout juste commencé" },
    island: "chip",
    summary: {
      en: "A computer I'm designing from logic gates in the game Turing Complete, with its own opcode table.",
      fr: "Un ordinateur que je conçois à partir de portes logiques dans le jeu Turing Complete, avec sa propre table d'opcodes.",
    },
    details: {
      en: ["Built gate by gate, with its own instruction set. It has only just started, so there is more to come."],
      fr: ["Construit porte par porte, avec son propre jeu d'instructions. Le projet vient de commencer : la suite arrive."],
    },
    tags: ["cpu", "assembly"],
    links: [],
  },
];
