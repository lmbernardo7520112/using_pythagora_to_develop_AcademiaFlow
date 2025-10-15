// client/src/pages/SecretariaAlunos.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAlunosByTurma,
  getTurmaById,
  updateAlunoStatus,
  AlunoDTO,
} from "@/api/secretaria";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import {
  CheckCircle,
  XCircle,
  ArrowRightCircle,
  CircleSlash,
} from "lucide-react";

export default function SecretariaAlunos() {
  const { turmaId } = useParams<{ turmaId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [alunos, setAlunos] = useState<AlunoDTO[]>([]);
  const [turmaNome, setTurmaNome] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleOpenModal = (aluno: AlunoDTO) => {
    setSelectedAluno(aluno);
    setSelectedStatus(
      aluno.transferido
        ? "transferido"
        : aluno.desistente
        ? "desistente"
        : aluno.ativo
        ? "ativo"
        : ""
    );
    setIsDialogOpen(true);
  };

  const handleChangeStatus = async () => {
    if (!selectedAluno || !selectedStatus) return;

    try {
      const payload = {
        ativo: selectedStatus === "ativo",
        transferido: selectedStatus === "transferido",
        desistente: selectedStatus === "desistente",
      };

      await updateAlunoStatus(selectedAluno._id, payload);

      setAlunos((prev) =>
        prev.map((a) =>
          a._id === selectedAluno._id ? { ...a, ...payload } : a
        )
      );

      toast({
        title: "Status atualizado",
        description: `O status de ${selectedAluno.nome} foi alterado para ${selectedStatus}.`,
      });

      setIsDialogOpen(false);
      setSelectedAluno(null);
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do aluno.",
        variant: "destructive",
      });
    }
  };

  const renderStatusIcon = (aluno: AlunoDTO) => {
    if (aluno.transferido)
      return <ArrowRightCircle className="inline text-yellow-600 w-4 h-4 ml-1" />;
    if (aluno.desistente)
      return <XCircle className="inline text-red-600 w-4 h-4 ml-1" />;
    if (aluno.ativo)
      return <CheckCircle className="inline text-green-600 w-4 h-4 ml-1" />;
    return <CircleSlash className="inline text-gray-400 w-4 h-4 ml-1" />;
  };

  if (loading) return <p className="p-6">Carregando alunos...</p>;
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
          {alunos.map((a) => (
            <Card key={a._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{a.nome}</span>
                  {renderStatusIcon(a)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Matrícula:</strong> {a.matricula}</p>
                <p><strong>Email:</strong> {a.email}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      a.transferido
                        ? "text-yellow-600"
                        : a.desistente
                        ? "text-red-600"
                        : a.ativo
                        ? "text-green-600"
                        : "text-gray-500"
                    }
                  >
                    {a.transferido
                      ? "Transferido"
                      : a.desistente
                      ? "Desistente"
                      : a.ativo
                      ? "Ativo"
                      : "Inativo"}
                  </span>
                </p>

                <div className="mt-3">
                  <Dialog open={isDialogOpen && selectedAluno?._id === a._id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        onClick={() => handleOpenModal(a)}
                      >
                        Alterar Status
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Alterar Status do Aluno</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        <p>
                          Aluno: <strong>{selectedAluno?.nome}</strong>
                        </p>

                        <Select
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o novo status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativo">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="text-green-600 w-4 h-4" />
                                Ativo
                              </div>
                            </SelectItem>
                            <SelectItem value="transferido">
                              <div className="flex items-center gap-2">
                                <ArrowRightCircle className="text-yellow-600 w-4 h-4" />
                                Transferido
                              </div>
                            </SelectItem>
                            <SelectItem value="desistente">
                              <div className="flex items-center gap-2">
                                <XCircle className="text-red-600 w-4 h-4" />
                                Desistente
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <DialogFooter className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleChangeStatus}>Salvar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
