/**
 * usePaginatedQuery.ts — Hook générique pour les listes paginées Laravel.
 *
 * Usage :
 *   const { data, page, lastPage, total, nextPage, prevPage, isLoading } =
 *     usePaginatedQuery({
 *       queryKey: ['grades'],
 *       fetcher: (params) => gradeService.listPaginated(params),
 *       perPage: 25,
 *     });
 */
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaginatedResponse } from '../lib/services/paginationService';
import { paginationParams } from '../lib/services/paginationService';

interface UsePaginatedQueryOptions<T> {
    queryKey: unknown[];
    fetcher:  (params: Record<string, string>) => Promise<PaginatedResponse<T>>;
    perPage?: number;
    /** Paramètres supplémentaires passés au fetcher (filtres, recherche…) */
    extraParams?: Record<string, string>;
}

export function usePaginatedQuery<T>({
    queryKey,
    fetcher,
    perPage = 25,
    extraParams = {},
}: UsePaginatedQueryOptions<T>) {
    const [page, setPage] = useState(1);
    const qc              = useQueryClient();

    const params = { ...paginationParams(page, perPage), ...extraParams };

    const { data: response, isLoading, isFetching, error } = useQuery<PaginatedResponse<T>>({
        queryKey: [...queryKey, page, perPage, extraParams],
        queryFn:  () => fetcher(params),
        placeholderData: (prev) => prev,  // garde l'ancienne page visible pendant le fetch
    });

    const lastPage   = response?.last_page   ?? 1;
    const total      = response?.total       ?? 0;
    const data       = response?.data        ?? [];
    const from       = response?.from        ?? 0;
    const to         = response?.to          ?? 0;

    const nextPage = () => {
        if (page < lastPage) {
            setPage(p => p + 1);
        }
    };

    const prevPage = () => {
        if (page > 1) {
            setPage(p => p - 1);
        }
    };

    const goToPage = (p: number) => {
        if (p >= 1 && p <= lastPage) setPage(p);
    };

    // Précharge la page suivante
    if (page < lastPage) {
        const nextParams = { ...paginationParams(page + 1, perPage), ...extraParams };
        qc.prefetchQuery({
            queryKey: [...queryKey, page + 1, perPage, extraParams],
            queryFn:  () => fetcher(nextParams),
        });
    }

    return {
        data,
        page,
        lastPage,
        total,
        from,
        to,
        isLoading,
        isFetching,
        error,
        nextPage,
        prevPage,
        goToPage,
        hasPrev: page > 1,
        hasNext: page < lastPage,
    };
}
