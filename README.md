# Fine Dine

A restaurant-service app concept and UX / service design case study by Swanand Kulkarni, informed by my work at Oblix, The Shard, London.

[View the case study](https://swanandkul03.github.io/Fine-Dine/)

## What the project explores

Paper order taking and in-person updates meant staff had to find colleagues to confirm requirements, check preparation and coordinate collection. Fine Dine connects those tasks across waiters, chefs and floor managers.

- Research from service observations and staff handovers.
- Original app screens and a connected Floor, Kitchen and Alerts prototype.
- A service story with character dialogue, workflow comparison and an evening restaurant setting.
- Staff feedback, timing comparisons and a 90-minute service Gantt chart.
- Selectable earlier/revised screens.

The phone layout keeps complete screens, controls and dialogue together. The original prototype colours and typography are retained; the embedded viewport scales proportionally rather than stretching.

## Run locally

No dependency installation or build step is required. From the repository folder:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Use a local web server so the prototype and embedded service story can communicate correctly.

## Project files

- `index.html` — case-study content and sections.
- `component-case.css` / `component-case.js` — editorial layout and screen annotations.
- `phone-layout.css` / `phone-layout.js` — phone layouts and proportional device fitting.
- `role-motion.js` / `role-motion.css` — articulated service characters and scene rendering.
- `evaluation-visual.css` / `evaluation-visual.js` — timing comparisons and service timeline.
- `prototype/` — the supplied interactive app and its local runtime.
- `service-flows/` — the published service story.
- `assets/` — original screen exports, local fonts and comparison images.

Edit the service story in `src/service-handover/`, then run:

```sh
python3 scripts/build-service-flows.py
```

GitHub Pages serves the static files from the root of `main`; `.nojekyll` preserves the files as supplied.

## Scope

This is an independent design concept, rather than a deployed restaurant ordering system. Staff feedback and the reported timing figures are explained in the case study. The unchanged 37–40 minute mains window reflects the guests’ pace. Restaurant-system integration and a controlled live-service evaluation remain further work.

The service dialogue illustrates the handover scenarios. Keyboard controls, reduced-motion preferences and responsive phone layouts are supported.

## Author

Swanand Kulkarni · UX Designer & Developer

[Portfolio](https://swanand-kulkarni.framer.website/)
