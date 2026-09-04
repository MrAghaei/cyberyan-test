import type { NextFunction, Request, Response } from 'express';

export function normalizeBracketQueryParams(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const query = req.query as Record<string, unknown>;

  for (const [key, value] of Object.entries({ ...query })) {
    const bracketMatch = key.match(/^(.+)\[\]$/);
    if (!bracketMatch) {
      continue;
    }

    const baseKey = bracketMatch[1];
    const existing = query[baseKey];

    if (existing === undefined) {
      query[baseKey] = value;
    } else if (Array.isArray(existing)) {
      query[baseKey] = [
        ...existing,
        ...(Array.isArray(value) ? value : [value]),
      ];
    } else {
      query[baseKey] = [existing, ...(Array.isArray(value) ? value : [value])];
    }

    delete query[key];
  }

  next();
}
