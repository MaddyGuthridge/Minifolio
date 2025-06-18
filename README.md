# Minifolio - showcase your best work

Minifolio is a portfolio content management system designed with flexibility and simplicity in mind.

Learn more about it, by checking out [the documentation](https://minifolio.maddyguthridge.com),
which is hosted using Minifolio itself.

## Developing

Running Minifolio requires a `.env` file, which you can create by running
`cp .env.example .env`. Make sure to edit your `.env` file to set its variables
as required.

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Testing

* Tests can be run with `npm t`. The dev server will be automatically started
  and stopped.
* Type checking can be run with `npm run check`.
* Linting can be run with `npm run lint`. Automatic fixes can be applied using
  `npm run lint:fix`.

### Building

To create a production version of the app:

```bash
npm run build
```

To run the production server:

```bash
npm run production
```

Or you can just use Docker: see instructions for the various docker configs in
the `docker/` directory.
