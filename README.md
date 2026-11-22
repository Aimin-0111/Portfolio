# Portfolio

My portfolio as a small painted world. Scrolling flies you through it: the home island, a gallery where each project hangs as a framed painting, and a quiet island for the about page. Every frame of the 3D scene is run through a brushstroke filter, so it looks painted rather than rendered.

- Light and dusk modes (the sun sets, the tower window lights up, fireflies come out)
- A gallery wall with every project, a museum-style label beside each piece, and a detail page for each one at `#/work/<id>`
- Works without WebGL: all text stays readable on a plain painted background
- Respects "reduce motion" settings
- Keyboard: <kbd>←</kbd> <kbd>→</kbd> walk between pieces (or projects, when one is open), <kbd>Esc</kbd> closes a project, <kbd>M</kbd> switches to an ink-drawing style

## Run it locally

The site has no build step, but it uses JavaScript modules, so it needs a local server rather than opening the file directly:

```sh
python -m http.server 4173
```

Then open <http://localhost:4173>.

## Edit the content

All text lives in two files. You don't need to touch the code for everyday changes.

| File | What it holds |
|---|---|
| `content/projects.js` | The projects, in order |
| `content/site.js` | The name, the order of places, home text, about text and contact links |
| `content/media/` | Project pictures |

### Add a project

Copy an entry in `content/projects.js` and change it:

```js
{
  id: "my-project",              // used in the link: #/work/my-project
  title: "My project",
  kind: "Game · Unity",
  year: "2026",
  role: "Solo project",
  image: { src: "content/media/my-project.jpg", alt: "What the picture shows" },
  island: "keep",                // only used without an image: keep, pin, voxel, robot, chip, moon or tree
  summary: "One or two sentences for the overview.",
  details: ["A paragraph for the detail page.", "Another one."],
  tags: ["unity", "c#"],
  links: [{ label: "Code", url: "https://github.com/..." }],
}
```

A new frame appears in the gallery automatically, with its own scroll step. Its picture is painted by the brush filter in the frame and shown crisp on its detail page; landscape pictures fit best. Without a picture, the frame holds a little island scene instead; to add a new kind, add a function to `assets/js/props.js`.

### Add a place

1. Add an id to `stops` in `content/site.js`.
2. Add a place for it in `PLACES` in `assets/js/world.js`: its position, camera framing and colors.
3. Add a panel for it in `PANELS` in `assets/js/ui.js`.

## How it's built

```
index.html            page shell
content/              everything written on the site
brand/tokens.css      colors, fonts and type scale (light and dusk)
assets/css/style.css  layout, wall text and labels
assets/js/
  main.js             starts the page, then loads the 3D world
  ui.js               text for each place, scroll-to-travel, project detail pages
  world.js            the world: places, flight path, light and colors
  gallery.js          the Work gallery: frames, layout and camera framing
  nature.js           islands, trees, the land below, clouds
  props.js            the little scenes on project islands
  paint.js            the painting filter (brushstrokes or ink)
```

Built with plain HTML, CSS and JavaScript, plus [Three.js](https://threejs.org) loaded from a CDN. The painting effect is a Kuwahara filter. The ink style follows Maxime Heckel's write-up on [Moebius-style post-processing](https://blog.maximeheckel.com/posts/moebius-style-post-processing). Fonts are Fraunces, Instrument Sans and DM Mono from Google Fonts.

## Publish it

Any static host works. With GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**.

## Made with AI assistance

This project was made with the help of an AI assistant (Claude, by Anthropic). The direction, choices and content are mine. Much of the code, the design exploration and this README were written with AI assistance.

## License

[MIT](LICENSE)
