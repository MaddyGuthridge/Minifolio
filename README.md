# Portfolio

This is my data-driven portfolio website, built using SvelteKit and TypeScript.

## Features

* The site is entirely built from a `data/` directory, where all information
  about projects, frameworks and languages is contained.
* Validation of all source data, using [Superstruct](https://docs.superstructjs.org/).
* Demos of projects using [Asciinema](https://asciinema.org/).

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

To run the production server:

```bash
node -r dotenv/config build
```

This requires a `.env` file with the following properties:

```ini
HOST=127.0.0.1
PORT=5096
```
