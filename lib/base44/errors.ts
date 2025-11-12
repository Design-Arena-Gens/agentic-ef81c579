export class Base44Error extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly detail?: unknown
  ) {
    super(message);
    this.name = 'Base44Error';
  }
}

export function parseBase44Error(err: unknown): Base44Error {
  if (err instanceof Base44Error) return err;
  if (typeof err === 'object' && err !== null) {
    const status = (err as { status?: number }).status ?? 500;
    const message =
      (err as { message?: string }).message ??
      (err as { detail?: string }).detail ??
      'Une erreur inattendue est survenue.';
    return new Base44Error(message, status, err);
  }

  return new Base44Error('Une erreur inattendue est survenue.', 500, err);
}
