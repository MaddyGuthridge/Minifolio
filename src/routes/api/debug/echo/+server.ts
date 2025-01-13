import { dev } from '$app/environment';
import { error, json } from '@sveltejs/kit';
import chalk from 'chalk';

export async function POST({ request }: import('./$types').RequestEvent) {
  if (!dev) error(404);
  const { text } = await request.json();
  console.log(chalk.bgMagenta.gray.bold(' ECHO '), text);

  return json({ text }, { status: 200 });
}
