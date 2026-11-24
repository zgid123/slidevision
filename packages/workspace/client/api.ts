import { apiPrefix, type IDeckSummary } from './shared';

export async function fetchDecks(): Promise<IDeckSummary[]> {
  const response = await fetch(`${apiPrefix}/decks`);

  if (!response.ok) {
    throw new Error(
      `The deck list request failed with status ${response.status}.`,
    );
  }

  return response.json();
}

export async function requestOpenDeck(id: string): Promise<IDeckSummary> {
  const response = await fetch(
    `${apiPrefix}/decks/${encodeURIComponent(id)}/open`,
    {
      method: 'POST',
    },
  );

  if (!response.ok) {
    throw new Error(`The open request failed with status ${response.status}.`);
  }

  return response.json();
}
