// client/src/pages/SecretariaAlunos.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlunoDTO,
  getAlunosByTurma,
  getTurmaById,
  updateAlunoStatus,
} from "@/api/secretaria";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  MoveRight,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface Aluno {
  _id: string;
  nome: string;
  matricula: string;
  email: string;
  ativo: boolean;
  transferido?: boolean;
  desistente?: boolean;
}

export default function SecretariaAlunos() {
  const { turmaId } = useParams<{ turmaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmaNome, setTurmaNome] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedAluno, setSelectedAluno] = useState<AlunoDTO | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!turmaId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [resAlunos, resTurma] = await Promise.all([
          getAlunosByTurma(turmaId),
          getTurmaById(turmaId),
        ]);
        setAlunos(resAlunos.data ?? []);
        setTurmaNome(resTurma.data?.nome ?? "Turma Desconhecida");
      } catch (err: any) {
        console.error("Erro ao carregar alunos:", err);
        setError("Não foi possível carregar os alunos desta turma.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [turmaId]);

  // Função para renderizar o status com ícone e cor
  const renderStatusBadge = (aluno: Aluno) => {
    if (aluno.ativo)
      return (
        <span className="flex items-center text-green-600 font-medium">
          <CheckCircle className="w-4 h-4 mr-1" /> Ativo
        </span>
      );
    if (aluno.transferido)
      return (
        <span className="flex items-center text-blue-500 font-medium">
          <MoveRight className="w-4 h-4 mr-1" /> Transferido
        </span>
      );
    if (aluno.desistente)
      return (
        <span className="flex items-center text-red-500 font-medium">
          <AlertTriangle className="w-4 h-4 mr-1" /> Desistente
        </span>
      );
    return (
      <span className="flex items-center text-gray-500 font-medium">
        <XCircle className="w-4 h-4 mr-1" /> Abandono
      </span>
    );
  };

  // Mapeia o status atual para a opção do dropdown
  const getCurrentStatus = (a: Aluno): string => {
    if (a.ativo) return "ativo";
    if (a.transferido) return "transferido";
    if (a.desistente) return "desistente";
    return "abandono";
  };

  // Atualiza o status do aluno
  const handleStatusChange = async (alunoId: string, novoStatus: string) => {
    setSavingId(alunoId);
    try {
      // Define o payload conforme o status escolhido
      const payload =
        novoStatus === "ativo"
          ? { ativo: true, transferido: false, desistente: false }
          : novoStatus === "transferido"
          ? { ativo: false, transferido: true, desistente: false }
          : novoStatus === "desistente"
          ? { ativo: false, transferido: false, desistente: true }
          : { ativo: false, transferido: false, desistente: false };

      await updateAlunoStatus(alunoId, payload);

      // Atualiza o estado local
      setAlunos((prev) =>
        prev.map((a) =>
          a._id === alunoId ? { ...a, ...payload } : a
        )
      );
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("❌ Falha ao atualizar o status do aluno.");
    } finally {
      setTimeout(() => setSavingId(null), 1200); // Delay visual
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => navigate("/secretaria/turmas")}>Voltar</Button>
      </div>
    );

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Alunos da Turma {turmaNome ?? ""}
        </h1>
        <Button variant="outline" onClick={() => navigate("/secretaria/turmas")}>
          ← Voltar para Turmas
        </Button>
      </div>

      {alunos.length === 0 ? (
        <p className="mt-4">Nenhum aluno encontrado para esta turma.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alunos.map((a) => {
            const statusAtual = getCurrentStatus(a);
            return (
              <Card key={a._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{a.nome}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <strong>Matrícula:</strong> {a.matricula}
                  </p>
                  <p>
                    <strong>Email:</strong> {a.email}
                  </p>

                  <div className="flex flex-col space-y-2">
                    <label className="font-medium">Status:</label>

                    {savingId === a._id ? (
                      <div className="flex items-center text-gray-500 text-sm">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </div>
                    ) : statusAtual ? (
                      <>
                        {/* Mostra status atual */}
                        {renderStatusBadge(a)}
                        <select
                          className="border border-border rounded-md px-2 py-1 text-sm mt-2"
                          value={statusAtual}
                          onChange={(e) =>
                            handleStatusChange(a._id, e.target.value)
                          }
                        >
                          <option value="ativo">Ativo</option>
                          <option value="transferido">Transferido</option>
                          <option value="desistente">Desistente</option>
                          <option value="abandono">Abandono</option>
                        </select>
                      </>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
