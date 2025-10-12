// server/services/relatorioService.ts
// server/services/relatorioService.ts
import Turma from "../models/Turma.js";
import Aluno from "../models/Aluno.js";
import { getGradesByTurmaAndDisciplina } from "./gradeService.js";
import { Types } from "mongoose";
import ExcelJS from "exceljs";

/**
 * relatorioService
 * Implementa:
 *  - getTaxasPorTurma(bimestre?)
 *  - listAlunosFiltered({turmaId, nome, ativo, page, limit})
 *  - generateExcelReport({turmaId})
 *  - getRelatorios(bimestre?)
 *
 * Mantém comportamento incremental (não altera modelos).
 */
const relatorioService = {
  /**
   * Taxas de aprovação por turma e (opcional) por bimestre.
   * Retorna: { referencia, turmas: { [turmaNome]: { total, aprovados, reprovados, taxa, taxaBim1?, ... } } }
   */
  async getTaxasPorTurma(bimestre?: number) {
    const turmas = await Turma.find({ ativo: true }).lean();
    const resultado: Record<string, any> = {};

    for (const turma of turmas) {
      if (!turma.disciplinas || turma.disciplinas.length === 0) {
        resultado[turma.nome] = { total: 0, aprovados: 0, reprovados: 0, taxa: "0%" };
        continue;
      }

      const disciplinaId = turma.disciplinas[0].toString();
      const grades = await getGradesByTurmaAndDisciplina(turma._id.toString(), disciplinaId);

      const total = grades.length;
      const aprovados = grades.filter((g: any) => g.situacao === "Aprovado").length;
      const reprovados = total - aprovados;
      const taxa = total > 0 ? ((aprovados / total) * 100).toFixed(1) + "%" : "0%";

      // Exemplo: possibilidade de estender para taxas por bimestre (se gradeService suportar bimestre)
      const item: any = { total, aprovados, reprovados, taxa };
      resultado[turma.nome] = item;
    }

    return { referencia: bimestre ? `Bimestre ${bimestre}` : "Geral", turmas: resultado };
  },

  /**
   * Lista filtrada de alunos com paginação
   */
  async listAlunosFiltered({
    turmaId,
    nome,
    ativo,
    page = 1,
    limit = 100,
  }: {
    turmaId?: string;
    nome?: string;
    ativo?: boolean;
    page?: number;
    limit?: number;
  }) {
    const q: any = {};
    if (turmaId && Types.ObjectId.isValid(turmaId)) q.turma = turmaId;
    if (typeof ativo === "boolean") q.ativo = ativo;
    if (nome) q.nome = { $regex: new RegExp(nome, "i") };

    const skip = Math.max(0, page - 1) * limit;
    const [items, total] = await Promise.all([
      Aluno.find(q).sort({ nome: 1 }).skip(skip).limit(limit).lean(),
      Aluno.countDocuments(q),
    ]);

    return { items, total, page, limit };
  },

  /**
   * Gera XLSX (buffer) com turmas e alunos. Usa exceljs.
   */
  async generateExcelReport({ turmaId }: { turmaId?: string }) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Relatório");

    sheet.columns = [
      { header: "Turma", key: "turma", width: 30 },
      { header: "Aluno", key: "aluno", width: 40 },
      { header: "Matrícula", key: "matricula", width: 20 },
      { header: "Email", key: "email", width: 40 },
      { header: "Ativo", key: "ativo", width: 10 },
      { header: "Media", key: "media", width: 10 },
      { header: "Situacao", key: "situacao", width: 15 },
    ];

    const turmas = turmaId && Types.ObjectId.isValid(turmaId)
      ? await Turma.find({ _id: turmaId }).populate("alunos").lean()
      : await Turma.find({ ativo: true }).populate("alunos").lean();

    for (const turma of turmas) {
      const alunos: any[] = turma.alunos ?? [];
      for (const a of alunos) {
        let media: number | null = null;
        let situacao = "Pendente";

        try {
          if (turma.disciplinas && turma.disciplinas.length > 0) {
            const disciplinaId = turma.disciplinas[0].toString();
            const grades = await getGradesByTurmaAndDisciplina(turma._id.toString(), disciplinaId);
            const found = grades.find((g: any) => g._id?.toString() === a._id?.toString());
            if (found) {
              media = typeof found.media === "number" ? found.media : null;
              situacao = found.situacao ?? situacao;
            }
          }
        } catch (err) {
          // swallow — não impede geração
        }

        sheet.addRow({
          turma: turma.nome,
          aluno: a.nome,
          matricula: a.matricula,
          email: a.email,
          ativo: a.ativo ? "Sim" : "Não",
          media,
          situacao,
        });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = turmaId ? `relatorio_turma_${turmaId}.xlsx` : `relatorio_turmas.xlsx`;
    return { buffer, filename };
  },

  /**
   * Agregador principal para o dashboard de relatórios (consumido pelo frontend)
   * Retorna:
   * { totalTurmas, totalAlunos, mediaGeral, taxaAprovacao, desempenhoPorTurma: [{turma, media}], referencia }
   */
  async getRelatorios(bimestre?: number) {
    const turmas = await Turma.find({ ativo: true }).lean();
    const totalTurmas = turmas.length;
    const totalAlunos = await Aluno.countDocuments({ ativo: true });

    const desempenhoPorTurma: { turma: string; media: number }[] = [];
    let somaMedias = 0;
    let quantMedias = 0;
    let totalAprovados = 0;
    let totalVerificados = 0;

    for (const turma of turmas) {
      if (!turma.disciplinas || turma.disciplinas.length === 0) {
        desempenhoPorTurma.push({ turma: turma.nome, media: 0 });
        continue;
      }

      const disciplinaId = turma.disciplinas[0].toString();
      const grades = await getGradesByTurmaAndDisciplina(turma._id.toString(), disciplinaId);

      const medias = grades
        .map((g: any) => (typeof g.media === "number" ? g.media : null))
        .filter((m: number | null) => m !== null) as number[];

      const turmaMedia = medias.length > 0 ? medias.reduce((a, b) => a + b, 0) / medias.length : 0;
      const aprovados = grades.filter((g: any) => g.situacao === "Aprovado").length;
      const verificados = grades.length;

      totalAprovados += aprovados;
      totalVerificados += verificados;

      if (turmaMedia > 0) {
        somaMedias += turmaMedia;
        quantMedias += 1;
      }

      desempenhoPorTurma.push({ turma: turma.nome, media: Number(turmaMedia.toFixed(2)) });
    }

    const mediaGeral = quantMedias > 0 ? Number((somaMedias / quantMedias).toFixed(2)) : 0;
    const taxaAprovacao = totalVerificados > 0 ? Number(((totalAprovados / totalVerificados) * 100).toFixed(2)) : 0;

    return {
      totalTurmas,
      totalAlunos,
      mediaGeral,
      taxaAprovacao,
      desempenhoPorTurma,
      referencia: bimestre ? `Bimestre ${bimestre}` : "Geral",
    };
  },
};

export default relatorioService;

