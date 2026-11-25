# Minifolio - showcase your best work

Minifolio is a portfolio content management system designed with flexibility and simplicity in mind.

Learn more about it, by checking out [the documentation](https://minifolio.maddyguthridge.com),
which is hosted using Minifolio itself.

## Developing

Running Minifolio requires a `.env` file, which you can create by running
`cp .env.example .env`. Make sure to edit your `.env` file to set its variables
as required.

The project uses [pnpm](https://pnpm.io/) as a dependency manager.

```bash
# Install dependencies
pnpm ci
# Start the server
pnpm dev
# Run test suite
pnpm t
# Run type-checking
pnpm check
# Run linting
pnpm lint
# Apply fixes
pnpm lint:fix
# Create a production build
pnpm build
# Run the production build
pnpm production
```
