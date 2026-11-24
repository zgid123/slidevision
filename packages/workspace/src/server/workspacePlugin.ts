import { createReadStream } from 'node:fs';
import type { ServerResponse } from 'node:http';
import { extname } from 'node:path';
import type { Plugin } from 'vite';

import { apiPrefix, deckStatus, type IDeckSummary } from '../../client/shared';
import type { IDeck } from '../interface';

const coverRoutePattern = /^\/decks\/([^/]+)\/cover$/;

const imageContentTypes: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

interface IWorkspacePluginParams {
  decks: IDeck[];
}

export function workspacePlugin({ decks }: IWorkspacePluginParams): Plugin {
  const decksById = new Map(
    decks.map((deck) => {
      return [deck.id, deck] as const;
    }),
  );

  return {
    name: 'slidevision:workspace',
    configureServer(server) {
      server.middlewares.use(apiPrefix, (request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost')
          .pathname;

        if (request.method !== 'GET') {
          next();

          return;
        }

        if (pathname === '/decks') {
          sendJson(response, decks.map(toSummary));

          return;
        }

        const coverId = coverRoutePattern.exec(pathname)?.[1];

        if (coverId) {
          sendCover(response, decksById.get(decodeURIComponent(coverId)));

          return;
        }

        next();
      });
    },
  };
}

function toSummary(deck: IDeck): IDeckSummary {
  return {
    id: deck.id,
    name: deck.name,
    status: deckStatus.stopped,
    ...(deck.cover ? { coverUrl: toCoverUrl(deck) } : {}),
  };
}

function toCoverUrl(deck: IDeck): string | undefined {
  if (deck.cover?.kind === 'url') {
    return deck.cover.url;
  }

  return `${apiPrefix}/decks/${encodeURIComponent(deck.id)}/cover`;
}

function sendJson(response: ServerResponse, data: unknown): void {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(data));
}

function sendCover(response: ServerResponse, deck: IDeck | undefined): void {
  if (deck?.cover?.kind !== 'file') {
    sendNotFound(response);

    return;
  }

  const path = deck.cover.path;
  const stream = createReadStream(path);

  stream.once('open', () => {
    response.setHeader(
      'Content-Type',
      imageContentTypes[extname(path).toLowerCase()] ??
        'application/octet-stream',
    );
    response.setHeader('X-Content-Type-Options', 'nosniff');
    stream.pipe(response);
  });
  stream.once('error', () => {
    sendNotFound(response);
  });
}

function sendNotFound(response: ServerResponse): void {
  response.statusCode = 404;
  response.end();
}
