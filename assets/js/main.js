import site from "../../content/site.js";
import projects from "../../content/projects.js";
import { createUI } from "./ui.js";

const ui = createUI({ site, projects });

/* the 3D world loads after the page is usable; without WebGL the page still works */
import("./world.js")
  .then(({ createWorld }) => {
    const world = createWorld(document.querySelector(".world"), { projects, stops: site.stops });
    ui.attach(world);
    document.documentElement.classList.add("world-ready");
  })
  .catch((err) => {
    console.warn("3D world unavailable:", err);
    document.documentElement.classList.add("no-world");
  });
