export type DailyQuote = {
  content: string;
  author: string;
};

export class QuoteApiError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'QuoteApiError';
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

type DummyJsonQuote = {
  id?: number;
  quote?: string;
  author?: string;
};

export async function fetchDailyQuote(): Promise<DailyQuote> {
  let response: Response;

  try {
    response = await fetch('https://dummyjson.com/quotes/random', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    throw new QuoteApiError(
      'Network error. Check your connection and try again.',
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new QuoteApiError(
      `Quote API failed with status ${response.status}. Please try again.`,
    );
  }

  let data: DummyJsonQuote;
  try {
    data = (await response.json()) as DummyJsonQuote;
  } catch (error) {
    throw new QuoteApiError(
      'Received an invalid response from the Quote API.',
      {
        cause: error,
      },
    );
  }

  const content = data.quote?.trim();
  const author = data.author?.trim();

  if (!content) {
    throw new QuoteApiError('Quote API returned an empty quote.');
  }

  return {
    content,
    author: author || 'Unknown',
  };
}
