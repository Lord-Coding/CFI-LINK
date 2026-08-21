/**
 * paginationService.ts — Types Laravel pagination + utilitaires
 *
 * Laravel retourne le format :
 * {
 *   data: T[],
 *   current_page: number,
 *   last_page: number,
 *   per_page: number,
 *   total: number,
 *   from: number | null,
 *   to: number | null,
 *   next_page_url: string | null,
 *   prev_page_url: string | null,
 * }
 */

export interface PaginatedResponse<T> {
    data:            T[];
    current_page:    number;
    last_page:       number;
    per_page:        number;
    total:           number;
    from:            number | null;
    to:              number | null;
    next_page_url:   string | null;
    prev_page_url:   string | null;
}

/** Construit les query params de pagination. */
export function paginationParams(page: number, perPage = 25): Record<string, string> {
    return { page: String(page), per_page: String(perPage) };
}

/** Récupère toutes les pages d'un endpoint paginé. */
export async function fetchAllPages<T>(
    fetcher: (params: Record<string, string>) => Promise<PaginatedResponse<T>>,
    perPage = 100,
): Promise<T[]> {
    let page   = 1;
    let result: T[] = [];

    while (true) {
        const res = await fetcher(paginationParams(page, perPage));
        result    = [...result, ...res.data];
        if (res.current_page >= res.last_page) break;
        page++;
    }

    return result;
}
