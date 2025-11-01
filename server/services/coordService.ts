// server/services/coordService.ts


import { AtividadeGerada } from "../models/AtividadeGerada.js";
import { ValidacaoPedagogica } from "../models/ValidacaoPedagogica.js";
import relatorioService from "./relatorioService.js";

/**
 * ============================================================
 * 🧠 Serviço principal da Coordenação Pedagógica
 * - Unifica contagem e listagem de atividades
 * - Garante consistência entre dashboard e cards
 * ============================================================
 */

/* ============================================================
   🔹 Dashboard da Coordenação
============================================================ */
export async function getCoordDashboard() {
  const totalAtividades = await AtividadeGerada.countDocuments();
  const atividadesValidadas = await AtividadeGerada.countDocuments({ validado: true });
  const pendentes = await AtividadeGerada.countDocuments({ validado: { $ne: true } });

  // 🔸 Inclui analytics de notas
  const turmasAnalytics = await relatorioService.getResumoPorTurma();

  // 🔸 Inclui até 10 atividades pendentes (para garantir sincronia com a listagem)
  const atividadesPendentesPreview = await AtividadeGerada.find({ validado: { $ne: true } })
    .populate("professorId", "nome email")
    .populate("disciplinaId", "nome codigo")
    .populate("turmaId", "nome codigo")
    .sort({ criadoEm: -1 })
    .limit(10)
    .lean();

  // 🔸 Professores mais ativos
  const professoresMaisAtivos = await AtividadeGerada.aggregate([
    { $group: { _id: "$professorId", totalAtividades: { $sum: 1 } } },
    { $sort: { totalAtividades: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "professor",
      },
    },
    { $unwind: "$professor" },
    {
      $project: {
        _id: 0,
        nome: "$professor.nome",
        email: "$professor.email",
        totalAtividades: 1,
      },
    },
  ]);

  return {
    totalAtividades,
    atividadesValidadas,
    pendentes,
    atividadesPendentesPreview,
    turmasAnalytics,
    professoresMaisAtivos,
  };
}

/* ============================================================
   🔹 Listar atividades pendentes (detalhada)
============================================================ */
export async function getCoordActivities() {
  return AtividadeGerada.find({ validado: { $ne: true } })
    .populate("professorId", "nome email")
    .populate("disciplinaId", "nome codigo")
    .populate("turmaId", "nome codigo")
    .sort({ criadoEm: -1 })
    .lean();
}

/* ============================================================
   🔹 Validar atividade
============================================================ */
export async function validateActivity(id: any, data: { feedback: any; validado: any }, user: { _id: any }) {
  const { feedback, validado } = data;

  const atividade = await AtividadeGerada.findByIdAndUpdate(
    id,
    {
      feedbackCoordenacao: feedback,
      validado,
      validadoEm: new Date(),
      validadoPor: user?._id,
    },
    { new: true }
  );

  await ValidacaoPedagogica.create({
    atividadeId: id,
    coordenadorId: user?._id,
    feedback,
    dataValidacao: new Date(),
  });

  return atividade;
}
