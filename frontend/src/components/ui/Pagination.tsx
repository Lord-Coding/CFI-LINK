import React from 'react';
import { IonButton, IonIcon } from '../../lib/ionic';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

interface PaginationProps {
    page:     number;
    lastPage: number;
    total:    number;
    from:     number;
    to:       number;
    onPrev:   () => void;
    onNext:   () => void;
    onPage?:  (p: number) => void;
    isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    page, lastPage, total, from, to,
    onPrev, onNext, onPage,
    isLoading = false,
}) => {
    if (lastPage <= 1) return null;

    // Génère les numéros de pages visibles (max 5)
    const range: (number | '…')[] = [];
    if (lastPage <= 5) {
        for (let i = 1; i <= lastPage; i++) range.push(i);
    } else {
        range.push(1);
        if (page > 3)         range.push('…');
        for (let i = Math.max(2, page - 1); i <= Math.min(lastPage - 1, page + 1); i++) range.push(i);
        if (page < lastPage - 2) range.push('…');
        range.push(lastPage);
    }

    return (
        <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '0.75rem 0.25rem',
            gap:            '0.5rem',
            flexWrap:       'wrap',
        }}>
            {/* Info résultats */}
            <span style={{ fontSize: '0.8rem', color: 'var(--ion-color-medium)' }}>
                {from}–{to} sur {total} résultats
            </span>

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <IonButton
                    fill="outline" size="small"
                    disabled={page <= 1 || isLoading}
                    onClick={onPrev}
                    style={{ '--border-radius': '8px', minWidth: '34px', height: '34px' } as React.CSSProperties}
                >
                    <IonIcon slot="icon-only" icon={chevronBackOutline} />
                </IonButton>

                {range.map((p, i) =>
                    p === '…' ? (
                        <span key={`ellipsis-${i}`} style={{ padding: '0 0.25rem', color: 'var(--ion-color-medium)', fontSize: '0.85rem' }}>…</span>
                    ) : (
                        <IonButton
                            key={p}
                            fill={p === page ? 'solid' : 'outline'}
                            size="small"
                            color={p === page ? 'primary' : 'medium'}
                            disabled={isLoading}
                            onClick={() => onPage?.(p as number)}
                            style={{ '--border-radius': '8px', minWidth: '34px', height: '34px' } as React.CSSProperties}
                        >
                            {p}
                        </IonButton>
                    )
                )}

                <IonButton
                    fill="outline" size="small"
                    disabled={page >= lastPage || isLoading}
                    onClick={onNext}
                    style={{ '--border-radius': '8px', minWidth: '34px', height: '34px' } as React.CSSProperties}
                >
                    <IonIcon slot="icon-only" icon={chevronForwardOutline} />
                </IonButton>
            </div>
        </div>
    );
};

export default Pagination;
