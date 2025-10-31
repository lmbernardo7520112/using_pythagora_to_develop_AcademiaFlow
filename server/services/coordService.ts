// server/services/coordService.ts
import { AtividadeGerada } from "../models/AtividadeGerada.js";
import { ValidacaoPedagogica } from "../models/ValidacaoPedagogica.js";
import relatorioService from "./relatorioService.js";

// ===========================================================
// DASHBOARD DA COORDENAÇÃO
// ===========================================================
export async function getCoordDashboard() {
  const totalAtividades = await AtividadeGerada.countDocuments();
  const atividadesValidadas = await AtividadeGerada.countDocuments({ validado: true });
  const pendentes = await AtividadeGerada.countDocuments({ validado: { $ne: true } });

  // Inclui analytics de notas
  const turmasAnalytics = await relatorioService.getResumoPorTurma();

  return {
    totalAtividades,
    atividadesValidadas,
    pendentes,
    turmasAnalytics,
  };
}

// ===========================================================
// LISTAR ATIVIDADES PENDENTES
// ===========================================================
export async function getCoordActivities() {
  return AtividadeGerada.find({ validado: { $ne: true } })
    .populate("professorId", "nome email")
    .populate("disciplinaId", "nome codigo")
    .populate("turmaId", "nome codigo")
    .lean();
}

// ===========================================================
// VALIDAR ATIVIDADE
// ===========================================================
export async function validateActivity(id: any, data: { feedback: any; validado: any; }, user: { _id: any; }) {
  const { feedback, validado } = data;

  // Atualiza documento de AtividadeGerada
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

  // Cria registro em ValidacaoPedagogica
  await ValidacaoPedagogica.create({
    atividadeId: id,
    coordenadorId: user?._id,
    feedback,
    dataValidacao: new Date(),
  });

  return atividade;
}
