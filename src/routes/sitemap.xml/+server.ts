import { iterItems } from '$lib/server/data/item';
import { create } from 'xmlbuilder2';

type Request = import('./$types').RequestEvent;

export async function GET(req: Request) {

  const baseUrl = `${req.url.protocol}//${req.url.host}`;

  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('urlset')
    .att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  for await (const id of iterItems()) {
    root.ele('url').ele('loc').txt(`${baseUrl}${id}`);
  }

  const xml = root.end();
  return new Response(
    xml,
    {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Length': `${Buffer.from(xml, 'utf-8').length}`,
      }
    }
  );
}
