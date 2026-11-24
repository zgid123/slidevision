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
