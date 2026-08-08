import { User, FILIERE_LABELS } from './store';
import { getGradesForStudent, calcMoyenne, calcMoyenneGenerale, GradeEntry } from './grades-store';

export type DocTemplateType =
    | 'attestation_inscription'
    | 'releve_notes'
    | 'certificat_scolarite'
    | 'attestation_reussite';

const HEADER = `
<div class="doc-header">
    <div class="doc-logo">
        <div class="doc-logo-icon">CFI</div>
        <div class="doc-logo-text">
            <strong>CFI-CIRAS</strong>
            <span>Centre de Formation en Informatique et Sciences Appliquées</span>
        </div>
    </div>
    <div class="doc-ref">
        <span>Réf. CFI/{{ANNEE}}/{{REF}}</span>
        <span>Yaoundé, le {{DATE}}</span>
    </div>
</div>
<hr class="doc-divider"/>
`;

const FOOTER = `
<div class="doc-footer">
    <div class="doc-footer-left">
        <p>BP 1234 — Yaoundé, Cameroun</p>
        <p>Tél. : +237 222 000 000</p>
        <p>Email : contact@cfi-ciras.org</p>
    </div>
    <div class="doc-footer-right">
        <p class="doc-signature-title">Le Directeur</p>
        <div class="doc-signature-line"></div>
        <p>Dr. Michel Fouda</p>
        <div class="doc-stamp">OFFICIEL</div>
    </div>
</div>
`;

const BASE_STYLES = `
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Times New Roman',Georgia,serif; color:#1a1a2e; background:#fff; padding:0; }
  .doc-page { max-width:760px; margin:0 auto; padding:40px 50px; min-height:100vh; display:flex; flex-direction:column; }

  .doc-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
  .doc-logo   { display:flex; align-items:center; gap:14px; }
  .doc-logo-icon { width:52px; height:52px; border-radius:12px; background:#1d4ed8; color:#fff; display:flex; align-items:center; justify-content:center; font-size:0.85rem; font-weight:900; letter-spacing:-0.5px; }
  .doc-logo-text { display:flex; flex-direction:column; }
  .doc-logo-text strong { font-size:1.1rem; color:#1d4ed8; }
  .doc-logo-text span   { font-size:0.72rem; color:#555; }

  .doc-ref { text-align:right; font-size:0.78rem; color:#666; display:flex; flex-direction:column; gap:4px; }

  .doc-divider { border:none; border-top:2.5px solid #1d4ed8; margin:8px 0 32px; }

  .doc-doc-title { text-align:center; margin-bottom:32px; }
  .doc-doc-title h1 { font-size:1.5rem; font-weight:bold; color:#1d4ed8; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px; }
  .doc-doc-title p  { font-size:0.82rem; color:#888; }

  .doc-body { flex:1; font-size:0.97rem; line-height:1.9; color:#222; }
  .doc-body p   { margin-bottom:12px; text-align:justify; }
  .doc-body strong { color:#111; }

  .doc-info-box {
      border:1.5px solid #cbd5e1; border-radius:10px;
      padding:18px 22px; margin:24px 0; background:#f8faff;
      display:grid; grid-template-columns:1fr 1fr; gap:10px 24px;
  }
  .doc-info-row { display:flex; flex-direction:column; }
  .doc-info-label { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#1d4ed8; margin-bottom:2px; }
  .doc-info-value { font-size:0.9rem; font-weight:600; color:#111; }

  .doc-footer { display:flex; justify-content:space-between; align-items:flex-end; margin-top:48px; padding-top:24px; border-top:1px solid #e2e8f0; }
  .doc-footer-left  { font-size:0.75rem; color:#666; line-height:1.8; }
  .doc-footer-right { text-align:right; }
  .doc-signature-title { font-size:0.85rem; font-weight:600; color:#333; margin-bottom:32px; }
  .doc-signature-line  { border-bottom:1.5px solid #333; width:160px; margin:0 0 8px auto; }
  .doc-footer-right p  { font-size:0.82rem; color:#333; }
  .doc-stamp {
      display:inline-block; border:2px solid #1d4ed8; color:#1d4ed8;
      font-size:0.75rem; font-weight:900; letter-spacing:0.12em;
      padding:5px 14px; border-radius:4px; margin-top:10px;
      transform:rotate(-8deg); opacity:0.7;
  }

  /* Table relevé */
  .doc-table { width:100%; border-collapse:collapse; margin:20px 0; font-size:0.85rem; }
  .doc-table th { background:#1d4ed8; color:#fff; padding:9px 12px; text-align:left; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; }
  .doc-table td { padding:8px 12px; border-bottom:1px solid #e2e8f0; }
  .doc-table tr:nth-child(even) td { background:#f8faff; }
  .doc-table .td-num { text-align:center; font-weight:700; }
  .doc-table .td-pass { color:#16a34a; font-weight:700; }
  .doc-table .td-fail { color:#dc2626; font-weight:700; }
  .doc-table tfoot td { font-weight:700; background:#f1f5f9; border-top:2px solid #1d4ed8; }

  @media print {
      body { padding:0; }
      .doc-page { padding:20mm 20mm; }
      .no-print { display:none !important; }
  }
</style>
`;

function makeHtml(body: string, title: string): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — CFI-CIRAS</title>
  ${BASE_STYLES}
</head>
<body>
  <div class="doc-page">
    ${body}
  </div>
</body>
</html>`;
}

function now(): string {
    return new Date().toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
}
function year(): string {
    const d = new Date();
    return `${d.getFullYear()-1}-${d.getFullYear()}`;
}
function ref(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function fillHeader(user: User): string {
    return HEADER
        .replace('{{ANNEE}}', String(new Date().getFullYear()))
        .replace('{{REF}}',   ref())
        .replace('{{DATE}}',  now());
}

/* ════════════════════════════════
   Modèles
════════════════════════════════ */

function attestationInscription(user: User): string {
    const filiere = user.filiere ? FILIERE_LABELS[user.filiere] : '—';
    const body = `
        ${fillHeader(user)}
        <div class="doc-doc-title">
            <h1>Attestation d'Inscription</h1>
            <p>Année académique ${year()}</p>
        </div>
        <div class="doc-body">
            <p>Le Directeur du Centre de Formation en Informatique — CFI-CIRAS, atteste que :</p>

            <div class="doc-info-box">
                <div class="doc-info-row">
                    <span class="doc-info-label">Nom complet</span>
                    <span class="doc-info-value">${user.nom_complet}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Filière</span>
                    <span class="doc-info-value">${filiere}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Niveau</span>
                    <span class="doc-info-value">${user.annee ?? '—'}${user.option ? ` — Option ${user.option}` : ''}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Année académique</span>
                    <span class="doc-info-value">${year()}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Type d'inscription</span>
                    <span class="doc-info-value">${user.role === 'etudiant_concours' ? 'Concours d\'entrée' : 'Étudiant externe'}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Statut</span>
                    <span class="doc-info-value">Régulièrement inscrit(e)</span>
                </div>
            </div>

            <p>est <strong>régulièrement inscrit(e)</strong> au sein de notre établissement pour l'année académique <strong>${year()}</strong>, dans la filière <strong>${filiere}</strong>, niveau <strong>${user.annee ?? '—'}</strong>.</p>

            <p>En foi de quoi, la présente attestation est délivrée pour servir et valoir ce que de droit.</p>
        </div>
        ${FOOTER}
    `;
    return makeHtml(body, "Attestation d'inscription");
}

function certificatScolarite(user: User): string {
    const filiere = user.filiere ? FILIERE_LABELS[user.filiere] : '—';
    const body = `
        ${fillHeader(user)}
        <div class="doc-doc-title">
            <h1>Certificat de Scolarité</h1>
            <p>Année académique ${year()}</p>
        </div>
        <div class="doc-body">
            <p>Je soussigné, Directeur du Centre de Formation en Informatique — CFI-CIRAS, certifie que l'étudiant(e) dont l'identité suit :</p>

            <div class="doc-info-box">
                <div class="doc-info-row">
                    <span class="doc-info-label">Nom complet</span>
                    <span class="doc-info-value">${user.nom_complet}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Adresse email</span>
                    <span class="doc-info-value">${user.email}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Filière</span>
                    <span class="doc-info-value">${filiere}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Niveau d'études</span>
                    <span class="doc-info-value">${user.annee ?? '—'}${user.option ? ` (Option ${user.option})` : ''}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Année académique</span>
                    <span class="doc-info-value">${year()}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Date de délivrance</span>
                    <span class="doc-info-value">${now()}</span>
                </div>
            </div>

            <p>est bien <strong>étudiant(e) au CFI-CIRAS</strong> pour l'année académique <strong>${year()}</strong>. Ce certificat est établi à la demande de l'intéressé(e) pour servir de justificatif auprès de toute administration, banque, ou organisme tiers.</p>

            <p>Ce document est valable pour l'année académique <strong>${year()}</strong> uniquement.</p>
        </div>
        ${FOOTER}
    `;
    return makeHtml(body, "Certificat de scolarité");
}

function releveNotes(user: User): string {
    const filiere = user.filiere ? FILIERE_LABELS[user.filiere] : '—';

    // Récupère les notes publiées depuis grades-store
    const grades: GradeEntry[] = getGradesForStudent(user.id);

    // Groupe par semestre pour affichage
    const semesters = [...new Set(grades.map(g => g.semestre))].sort();

    const buildSemesterTable = (sem: string) => {
        const entries = grades.filter(g => g.semestre === sem);
        if (entries.length === 0) return '';

        const rows = entries.map(g => {
            const moy = calcMoyenne(g.cc, g.tp, g.exam);
            const pass = moy !== null && moy >= 10;
            return `
                <tr>
                    <td>${g.course_name}</td>
                    <td class="td-num">${g.cc !== null ? g.cc + '/20' : '—'}</td>
                    <td class="td-num">${g.tp !== null ? g.tp + '/20' : '—'}</td>
                    <td class="td-num">${g.exam !== null ? g.exam + '/20' : '—'}</td>
                    <td class="td-num">${g.coef}</td>
                    <td class="td-num ${pass ? 'td-pass' : 'td-fail'}">${moy !== null ? moy.toFixed(2) + '/20' : '—'}</td>
                    <td class="td-num">${moy !== null ? (pass ? '✓' : '✗') : '—'}</td>
                </tr>`;
        }).join('');

        const moyGen = calcMoyenneGenerale(entries);
        const totalCoef = entries.reduce((a, g) => a + g.coef, 0);
        const semPass = moyGen >= 10;

        return `
            <h3 style="font-size:1rem;color:#1d4ed8;margin:20px 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px">
                Semestre ${sem}
            </h3>
            <table class="doc-table">
                <thead>
                    <tr>
                        <th>Matière</th>
                        <th style="text-align:center">CC</th>
                        <th style="text-align:center">TP</th>
                        <th style="text-align:center">Exam</th>
                        <th style="text-align:center">Coef.</th>
                        <th style="text-align:center">Moyenne</th>
                        <th style="text-align:center">Résultat</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="4"><strong>Moyenne générale ${sem}</strong></td>
                        <td class="td-num">${totalCoef}</td>
                        <td class="td-num ${semPass ? 'td-pass' : 'td-fail'}">${moyGen.toFixed(2)}/20</td>
                        <td class="td-num">${semPass ? '✓ ADMIS' : '✗ AJOURNÉ'}</td>
                    </tr>
                </tfoot>
            </table>`;
    };

    // Si aucune note publiée, on affiche un message
    const noGrades = grades.length === 0;
    const tablesHtml = noGrades
        ? `<p style="color:#888;font-style:italic;text-align:center;padding:2rem 0">
               Aucune note publiée pour cet étudiant pour le moment.
           </p>`
        : semesters.map(buildSemesterTable).join('');

    const moyGlobale = grades.length > 0 ? calcMoyenneGenerale(grades) : null;

    const body = `
        ${fillHeader(user)}
        <div class="doc-doc-title">
            <h1>Relevé de Notes</h1>
            <p>Année académique ${year()}</p>
        </div>
        <div class="doc-body">
            <div class="doc-info-box" style="margin-bottom:24px">
                <div class="doc-info-row">
                    <span class="doc-info-label">Étudiant(e)</span>
                    <span class="doc-info-value">${user.nom_complet}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Filière</span>
                    <span class="doc-info-value">${filiere} — ${user.annee ?? '—'}${user.option ? ` (${user.option})` : ''}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Email</span>
                    <span class="doc-info-value">${user.email}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Année académique</span>
                    <span class="doc-info-value">${year()}</span>
                </div>
            </div>

            ${tablesHtml}

            ${moyGlobale !== null ? `
            <div style="margin-top:20px;padding:12px 18px;border-radius:8px;background:${moyGlobale >= 10 ? '#f0fdf4' : '#fef2f2'};border:1.5px solid ${moyGlobale >= 10 ? '#86efac' : '#fca5a5'}">
                <strong style="color:${moyGlobale >= 10 ? '#16a34a' : '#dc2626'}">
                    Moyenne générale toutes matières : ${moyGlobale.toFixed(2)}/20
                    — ${moyGlobale >= 10 ? 'ADMIS(E)' : 'AJOURNÉ(E)'}
                </strong>
            </div>` : ''}

            <p style="font-size:0.75rem;color:#888;margin-top:12px">
                CC = Contrôle Continu · TP = Travaux Pratiques · Exam = Examen Final
            </p>
        </div>
        ${FOOTER}
    `;
    return makeHtml(body, "Relevé de notes");
}

function attestationReussite(user: User): string {
    const filiere = user.filiere ? FILIERE_LABELS[user.filiere] : '—';
    const body = `
        ${fillHeader(user)}
        <div class="doc-doc-title">
            <h1>Attestation de Réussite</h1>
            <p>Année académique ${year()}</p>
        </div>
        <div class="doc-body">
            <p>Le Directeur du Centre de Formation en Informatique — CFI-CIRAS atteste que l'étudiant(e) :</p>

            <div class="doc-info-box">
                <div class="doc-info-row">
                    <span class="doc-info-label">Nom complet</span>
                    <span class="doc-info-value">${user.nom_complet}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Filière</span>
                    <span class="doc-info-value">${filiere}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Niveau validé</span>
                    <span class="doc-info-value">${user.annee ?? '—'}${user.option ? ` — Option ${user.option}` : ''}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Mention</span>
                    <span class="doc-info-value">Assez Bien</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Année académique</span>
                    <span class="doc-info-value">${year()}</span>
                </div>
                <div class="doc-info-row">
                    <span class="doc-info-label">Date de délivrance</span>
                    <span class="doc-info-value">${now()}</span>
                </div>
            </div>

            <p>a <strong>réussi</strong> avec succès l'ensemble des épreuves de l'année académique <strong>${year()}</strong> au sein de notre établissement, dans la filière <strong>${filiere}</strong>, niveau <strong>${user.annee ?? '—'}</strong>.</p>

            <p>La présente attestation est délivrée pour servir et valoir ce que de droit, dans l'attente de la délivrance du diplôme officiel.</p>
        </div>
        ${FOOTER}
    `;
    return makeHtml(body, "Attestation de réussite");
}

/* ════════════════════════════════
   Export principal
════════════════════════════════ */
export function generateDocument(type: DocTemplateType, user: User): string {
    switch (type) {
        case 'attestation_inscription': return attestationInscription(user);
        case 'certificat_scolarite':    return certificatScolarite(user);
        case 'releve_notes':            return releveNotes(user);
        case 'attestation_reussite':    return attestationReussite(user);
        default:                        return attestationInscription(user);
    }
}

export function printDocument(html: string): void {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
}

export function downloadDocumentAsPdf(html: string, filename: string): void {
    /* Ouvre dans un nouvel onglet — l'utilisateur peut "Enregistrer en PDF" via le dialogue d'impression */
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    /* On injecte un bouton "Imprimer / Sauvegarder en PDF" */
    const btn = w.document.createElement('button');
    btn.textContent = '🖨️ Imprimer / Télécharger PDF';
    btn.style.cssText = 'position:fixed;top:12px;right:12px;z-index:9999;background:#1d4ed8;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-size:14px;cursor:pointer;font-family:sans-serif;box-shadow:0 4px 14px rgba(0,0,0,0.2)';
    btn.className = 'no-print';
    btn.onclick = () => w.print();
    w.document.body.appendChild(btn);
}
