import { createReadStream } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { extname } from 'node:path';
import type { IDeck } from '@contracts/project';
import type { Plugin } from 'vite';

import { apiPrefix, deckStatusEvent } from '../../client/shared';
import type { DeckServers } from './DeckServers';

const coverRoutePattern = /^\/decks\/([^/]+)\/cover$/;
const openRoutePattern = /^\/decks\/([^/]+)\/open$/;

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
  deckServers: DeckServers;
}

export function workspacePlugin({
  decks,
  deckServers,
}: IWorkspacePluginParams): Plugin {
  const decksById = new Map(
    decks.map((deck) => {
      return [deck.id, deck] as const;
    }),
  );

  return {
    name: 'slidevision:workspace',
    configureServer(server) {
      const unsubscribe = deckServers.subscribe((summary) => {
        server.ws.send({
          type: 'custom',
          event: deckStatusEvent,
          data: summary,
        });
      });

      server.httpServer?.once('close', unsubscribe);
      server.middlewares.use(apiPrefix, (request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost')
          .pathname;

        if (request.method === 'GET' && pathname === '/decks') {
          sendJson(response, 200, deckServers.summaries());

          return;
        }

        const coverId = coverRoutePattern.exec(pathname)?.[1];

        if (request.method === 'GET' && coverId) {
          sendCover(response, decksById.get(decodeURIComponent(coverId)));

          return;
        }

        const openId = openRoutePattern.exec(pathname)?.[1];

        if (request.method === 'POST' && openId) {
          void openDeck(
            request,
            response,
            deckServers,
            decodeURIComponent(openId),
          ).catch(next);

          return;
        }

        next();
      });
    },
  };
}

async function openDeck(
  request: IncomingMessage,
  response: ServerResponse,
  deckServers: DeckServers,
  id: string,
): Promise<void> {
  if (!isSameOrigin(request)) {
    sendJson(response, 403, {
      error: 'Decks can only be opened from the landing page.',
    });

    return;
  }

  if (
    !deckServers.has({
      id,
    })
  ) {
    sendNotFound(response);

    return;
  }

  sendJson(
    response,
    200,
    await deckServers.open({
      id,
    }),
  );
}

function isSameOrigin(request: IncomingMessage): boolean {
  const origin = request.headers.origin;

  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  data: unknown,
): void {
  response.statusCode = statusCode;
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
