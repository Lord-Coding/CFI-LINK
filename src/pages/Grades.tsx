import React, { useState } from 'react';
import {
    IonButton, IonIcon, IonProgressBar,
    IonSegment, IonSegmentButton, IonLabel,
} from '../lib/ionic';
import {
    trendingUpOutline, ribbonOutline, downloadOutline,
    documentTextOutline, printOutline, checkmarkCircleOutline,
    closeCircleOutline, schoolOutline, timeOutline,
} from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import { FILIERE_LABELS } from '../lib/store';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../components';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/Grades.css';

/* ── Types ── */
interface GradeRow {
    matiere: string;
    cc:      number | null;
    tp:      number | null;
    exam:    number | null;
    coef:    number;
}

/* ── Données mockées ── */
const MOCK_GRADES: Record<string, GradeRow[]> = {
    S1: [
        { matiere: 'Algorithmique avancée',     cc: 14, tp: 16, exam: 13, coef: 4 },
        { matiere: 'Base de données',            cc: 12, tp: 15, exam: 14, coef: 3 },
        { matiere: 'Mathématiques',              cc: 10, tp: null, exam: 11, coef: 3 },
        { matiere: 'Anglais technique',          cc: 15, tp: null, exam: 16, coef: 2 },
        { matiere: 'Réseaux informatiques',      cc: 13, tp: 14, exam: 12, coef: 3 },
    ],
    S2: [
        { matiere: 'Programmation Web',          cc: 16, tp: 17, exam: 15, coef: 4 },
        { matiere: "Systèmes d'exploitation",    cc: 11, tp: 13, exam: 12, coef: 3 },
        { matiere: 'Statistiques',               cc: 13, tp: null, exam: 14, coef: 2 },
        { matiere: 'Droit informatique',         cc: 15, tp: null, exam: 14, coef: 2 },
        { matiere: 'Projet tutoré',              cc: null, tp: 16, exam: null, coef: 4 },
    ],
};

/* ── Helpers ── */
function calcMoyenne(cc: number | null, tp: number | null, exam: number | null): number | null {
    const notes = [cc, tp, exam].filter((n): n is number => n !== null);
    if (notes.length === 0) return null;
    return notes.reduce((a, b) => a + b, 0) / notes.length;
}

function calcMoyenneGenerale(grades: GradeRow[]): number {
    let total = 0, coefs = 0;
    for (const g of grades) {
        const m = calcMoyenne(g.cc, g.tp, g.exam);
        if (m !== null) { total += m * g.coef; coefs += g.coef; }
    }
    return coefs > 0 ? total / coefs : 0;
}

function noteColor(val: number | null): string {
    if (val === null) return '';
    if (val >= 16) return 'gr-note--excellent';
    if (val >= 12) return 'gr-note--good';
    if (val >= 10) return 'gr-note--pass';
    return 'gr-note--fail';
}

/* ── Export PDF (impression) ── */
function printReleve(user: ReturnType<typeof useAuth>['user'], sem: string, grades: GradeRow[]) {
    if (!user) return;
    const moyenne = calcMoyenneGenerale(grades);
    const filiere = user.filiere ? FILIERE_LABELS[user.filiere] : '—';
    const rows = grades.map(g => {
        const m = calcMoyenne(g.cc, g.tp, g.exam);
        const color = m !== null && m >= 10 ? '#16a34a' : '#dc2626';
        return `<tr>
          <td style="padding:8px;border:1px solid #ddd">${g.matiere}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${g.cc ?? '—'}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${g.tp ?? '—'}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${g.exam ?? '—'}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${g.coef}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;font-weight:bold;color:${color}">${m !== null ? m.toFixed(2) : '—'}</td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Relevé de notes — ${user.nom_complet}</title>
<style>body{font-family:Arial,sans-serif;padding:40px;color:#333}h1{color:#1d4ed8;font-size:22px}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#1d4ed8;color:#fff;padding:10px;text-align:center}.header{display:flex;justify-content:space-between;border-bottom:3px solid #1d4ed8;padding-bottom:20px;margin-bottom:20px}.footer{margin-top:30px;text-align:center;color:#666;font-size:12px}</style>
</head><body>
<div class="header">
  <div><h1>CFI-CIRAS</h1><p>Centre de Formation en Informatique — CIRAS</p></div>
  <div style="text-align:right"><p><strong>RELEVÉ DE NOTES</strong></p><p>${sem} — ${new Date().getFullYear()}</p></div>
</div>
<p><strong>Étudiant :</strong> ${user.nom_complet}</p>
<p><strong>Filière :</strong> ${filiere} — ${user.annee ?? ''}${user.option ? ` (${user.option})` : ''}</p>
<table><thead><tr><th>Matière</th><th>CC</th><th>TP</th><th>Examen</th><th>Coef</th><th>Moyenne</th></tr></thead>
<tbody>${rows}</tbody></table>
<p style="font-size:16px"><strong>Moyenne générale : ${moyenne.toFixed(2)}/20</strong> — <span style="color:${moyenne >= 10 ? '#16a34a' : '#dc2626'}">${moyenne >= 10 ? 'VALIDÉ' : 'NON VALIDÉ'}</span></p>
<div class="footer"><p>Document généré le ${new Date().toLocaleDateString('fr-FR')} — CFI-LINK</p></div>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); w.print(); }
}

/* ── Export CSV ── */
function exportCSV(grades: GradeRow[], sem: string) {
    const header = 'Matière,CC,TP,Examen,Coefficient,Moyenne\n';
    const rows   = grades.map(g => {
        const m = calcMoyenne(g.cc, g.tp, g.exam);
        return `"${g.matiere}",${g.cc ?? ''},${g.tp ?? ''},${g.exam ?? ''},${g.coef},${m !== null ? m.toFixed(2) : ''}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `releve_notes_${sem}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

/* ════════════════════════════════
   Page principale
════════════════════════════════ */
const Grades: React.FC = () => {
    const { user }   = useAuth();
    const [sem, setSem] = useState<'S1' | 'S2'>('S1');

    if (!user) return null;

    const grades  = MOCK_GRADES[sem];
    const moyenne = calcMoyenneGenerale(grades);
    const valide  = moyenne >= 10;

    /* Répartition par mention */
    const excellent = grades.filter(g => { const m = calcMoyenne(g.cc, g.tp, g.exam); return m !== null && m >= 16; }).length;
    const bon       = grades.filter(g => { const m = calcMoyenne(g.cc, g.tp, g.exam); return m !== null && m >= 12 && m < 16; }).length;
    const passable  = grades.filter(g => { const m = calcMoyenne(g.cc, g.tp, g.exam); return m !== null && m >= 10 && m < 12; }).length;
    const insuffisant = grades.filter(g => { const m = calcMoyenne(g.cc, g.tp, g.exam); return m !== null && m < 10; }).length;

    return (
        <DashboardLayout>

            {/* ── Hero ── */}
            <div className="gr-hero">
                <div className="gr-hero-text">
                    <h1 className="gr-hero-title">Notes & Résultats</h1>
                    <p className="gr-hero-sub">
                        {user.filiere ? `${FILIERE_LABELS[user.filiere]} — ${user.annee}` : 'Étudiant'}
                        {user.option ? ` (${user.option})` : ''}
                    </p>
                    <div className="gr-hero-badges">
                        <span className="gr-hero-badge">
                            <IonIcon icon={schoolOutline} />
                            {grades.length} matières
                        </span>
                        <span className={`gr-hero-badge ${valide ? 'gr-hero-badge--success' : 'gr-hero-badge--danger'}`}>
                            <IonIcon icon={valide ? checkmarkCircleOutline : closeCircleOutline} />
                            Moyenne : {moyenne.toFixed(2)}/20
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Segment semestre ── */}
            <div className="gr-toolbar">
                <IonSegment
                    mode="ios"
                    value={sem}
                    className="gr-segment"
                    onIonChange={e => setSem(String(e.detail.value) as 'S1' | 'S2')}
                >
                    <IonSegmentButton value="S1" className="gr-seg-btn">
                        <IonLabel>Semestre 1</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="S2" className="gr-seg-btn">
                        <IonLabel>Semestre 2</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
            </div>

            {/* ── Résumé stats ── */}
            <div className="gr-stats-row">
                <div className="gr-stat-card">
                    <div className="gr-stat-icon gr-stat-icon--primary">
                        <IonIcon icon={trendingUpOutline} />
                    </div>
                    <div>
                        <p className="gr-stat-value">{moyenne.toFixed(2)}</p>
                        <p className="gr-stat-label">Moyenne générale</p>
                    </div>
                </div>

                <div className="gr-stat-card">
                    <div className={`gr-stat-icon ${valide ? 'gr-stat-icon--success' : 'gr-stat-icon--danger'}`}>
                        <IonIcon icon={ribbonOutline} />
                    </div>
                    <div>
                        <p className="gr-stat-value">{valide ? 'Validé' : 'Non validé'}</p>
                        <p className="gr-stat-label">Statut {sem}</p>
                    </div>
                </div>

                <div className="gr-stat-card gr-stat-card--mentions">
                    <p className="gr-stat-label gr-stat-label--top">Répartition</p>
                    <div className="gr-mentions">
                        <span className="gr-mention gr-mention--excellent">{excellent} ≥16</span>
                        <span className="gr-mention gr-mention--good">{bon} ≥12</span>
                        <span className="gr-mention gr-mention--pass">{passable} ≥10</span>
                        <span className="gr-mention gr-mention--fail">{insuffisant} &lt;10</span>
                    </div>
                </div>
            </div>

            {/* ── Boutons export ── */}
            <div className="gr-export-row">
                <IonButton fill="outline" size="small" color="primary" className="gr-export-btn" onClick={() => printReleve(user, sem, grades)}>
                    <IonIcon slot="start" icon={printOutline} />
                    Relevé PDF
                </IonButton>
                <IonButton fill="outline" size="small" color="medium" className="gr-export-btn" onClick={() => exportCSV(grades, sem)}>
                    <IonIcon slot="start" icon={downloadOutline} />
                    Export CSV
                </IonButton>
            </div>

            {/* ── Tableau de notes ── */}
            <Card variant="default" className="gr-table-card">
                <CardHeader className="gr-table-card-header">
                    <CardTitle>Notes — {sem}</CardTitle>
                    <Badge variant={valide ? 'success' : 'danger'} size="sm" dot>
                        {valide ? 'Semestre validé' : 'Non validé'}
                    </Badge>
                </CardHeader>
                <CardContent padding="sm">
                    <div className="gr-table-scroll">
                        <table className="gr-table">
                            <thead>
                                <tr className="gr-thead-tr">
                                    <th className="gr-th gr-th--matiere">Matière</th>
                                    <th className="gr-th gr-th--center">CC</th>
                                    <th className="gr-th gr-th--center">TP</th>
                                    <th className="gr-th gr-th--center">Examen</th>
                                    <th className="gr-th gr-th--center">Coef</th>
                                    <th className="gr-th gr-th--center">Moyenne</th>
                                    <th className="gr-th gr-th--progress">Progression</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grades.map((g, idx) => {
                                    const moy = calcMoyenne(g.cc, g.tp, g.exam);
                                    return (
                                        <tr key={idx} className="gr-tr">
                                            <td className="gr-td gr-td--matiere">
                                                <div className="gr-matiere-cell">
                                                    <IonIcon icon={documentTextOutline} className="gr-matiere-icon" />
                                                    <span>{g.matiere}</span>
                                                </div>
                                            </td>
                                            <td className="gr-td gr-td--center">
                                                <span className={`gr-note ${noteColor(g.cc)}`}>{g.cc ?? '—'}</span>
                                            </td>
                                            <td className="gr-td gr-td--center">
                                                <span className={`gr-note ${noteColor(g.tp)}`}>{g.tp ?? '—'}</span>
                                            </td>
                                            <td className="gr-td gr-td--center">
                                                <span className={`gr-note ${noteColor(g.exam)}`}>{g.exam ?? '—'}</span>
                                            </td>
                                            <td className="gr-td gr-td--center">
                                                <span className="gr-coef">{g.coef}</span>
                                            </td>
                                            <td className="gr-td gr-td--center">
                                                <span className={`gr-moyenne ${moy !== null && moy >= 10 ? 'gr-moyenne--pass' : moy !== null ? 'gr-moyenne--fail' : ''}`}>
                                                    {moy !== null ? moy.toFixed(2) : '—'}
                                                </span>
                                            </td>
                                            <td className="gr-td gr-td--progress">
                                                {moy !== null && (
                                                    <div className="gr-progress-cell">
                                                        <IonProgressBar
                                                            value={moy / 20}
                                                            className={`gr-progress-bar ${moy >= 10 ? 'gr-progress-bar--pass' : 'gr-progress-bar--fail'}`}
                                                        />
                                                        <span className="gr-progress-pct">{Math.round((moy / 20) * 100)}%</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Ligne moyenne générale */}
                                <tr className="gr-tr gr-tr--total">
                                    <td className="gr-td gr-td--matiere gr-td--total" colSpan={4}>
                                        Moyenne générale
                                    </td>
                                    <td className="gr-td gr-td--center gr-td--total">
                                        {grades.reduce((a, g) => a + g.coef, 0)}
                                    </td>
                                    <td className="gr-td gr-td--center gr-td--total" colSpan={2}>
                                        <span className={`gr-moyenne gr-moyenne--lg ${valide ? 'gr-moyenne--pass' : 'gr-moyenne--fail'}`}>
                                            {moyenne.toFixed(2)}/20
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

        </DashboardLayout>
    );
};

export default Grades;
