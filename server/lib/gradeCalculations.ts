// server/lib/gradeCalculator.ts


/**
 * Módulo unificado de cálculo de notas.
 * Regras (configuráveis aqui):
 *  - PASS_THRESHOLD: nota de aprovação direta (mg >= PASS_THRESHOLD => Aprovado)
 *  - RECOVERY_THRESHOLD: limite inferior para recuperar (mg >= RECOVERY_THRESHOLD => Recuperação)
 *
 * Estratégia aplicada (compatível com frontend):
 *  - nf = média simples das avaliações bimestres válidas (avaliacao1..4)
 *  - mg = nf (no nosso modelo atual não há pesos adicionais)
 *  - mf = se mg >= PASS_THRESHOLD -> mf = mg
 *         caso contrário, se houver pf (prova de recuperação) -> mf = round((mg + pf) / 2, 2)
 *         caso contrário -> mf = mg
 *  - status interino (antes de PF): com base em mg
 *  - situação final: para persistência no BD usamos 'situacao' derivada de mg (se quiser que situação final considere mf, ajustar)
 *
 * Observação: optamos por usar MG (média dos bimestres) para determinar a situação persistida.
 * A lógica completa está exposta e parametrizável.
 */

export type Situacao = 'Aprovado' | 'Reprovado' | 'Recuperação' | 'Pendente';

export interface Notas {
  avaliacao1?: number;
  avaliacao2?: number;
  avaliacao3?: number;
  avaliacao4?: number;
  pf?: number; // prova de recuperação
  final?: number; // campo opcional se existirem notas finais explícitas
  [key: string]: number | undefined;
}

// Configurável: thresholds
export const PASS_THRESHOLD = 6.0; // aprovacao direta (ajustável)
export const RECOVERY_THRESHOLD = 4.0; // limite inferior para recuperação

function round2(v: number): number {
  return Number(v.toFixed(2));
}

/**
 * Calcula NF: média simples das avaliações bimestrais (avaliacao1..4).
 * Retorna null se não há notas válidas.
 */
export function calculateNF(notas: Notas): number | null {
  const fields = ['avaliacao1', 'avaliacao2', 'avaliacao3', 'avaliacao4'];
  const vals: number[] = [];

  for (const f of fields) {
    const v = notas[f];
    if (typeof v === 'number' && !isNaN(v)) vals.push(v);
  }

  if (vals.length === 0) return null;
  const soma = vals.reduce((s, x) => s + x, 0);
  return round2(soma / vals.length);
}

/**
 * MG: neste sistema mg === nf (mantemos função separada para facilidade de extensão).
 */
export function calculateMG(nf: number | null): number | null {
  return nf;
}

/**
 * MF: média final considerando prova de recuperação (pf).
 * Se mg >= PASS_THRESHOLD -> mf = mg
 * Se mg < PASS_THRESHOLD and pf exists -> mf = (mg + pf) / 2
 * Caso contrário -> mf = mg
 */
export function calculateMF(mg: number | null, pf?: number): number | null {
  if (mg === null) return null;
  if (mg >= PASS_THRESHOLD) return mg;
  if (typeof pf === 'number' && !isNaN(pf)) {
    return round2((mg + pf) / 2);
  }
  return mg;
}

/**
 * Determina situação com base em MG (valor antes de PF).
 * - mg === null -> Pendente
 * - mg >= PASS_THRESHOLD -> Aprovado
 * - mg >= RECOVERY_THRESHOLD -> Recuperação
 * - mg < RECOVERY_THRESHOLD -> Reprovado
 */
export function calculateSituacao(mg: number | null): Situacao {
  if (mg === null) return 'Pendente';
  if (mg >= PASS_THRESHOLD) return 'Aprovado';
  if (mg >= RECOVERY_THRESHOLD) return 'Recuperação';
  return 'Reprovado';
}

/**
 * Função completa que aceita o objeto 'notas' e devolve:
 *  - media: aqui usamos MG (média dos bimestres) como valor persistido
 *  - situacao: com base em MG (antes de considerar PF)
 *
 * Observação: se preferir que a 'situacao' persistida seja a situação final (após considerar PF),
 * alterar para usar 'mf' na determinação da situação.
 */
export function calculateGrade(notas: Notas): { media: number | null; situacao: Situacao } {
  const nf = calculateNF(notas); // média dos bimestres
  const mg = calculateMG(nf);
  // usamos mg como media persistida
  const situacao = calculateSituacao(mg);

  return { media: mg, situacao };
}
