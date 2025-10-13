// client/src/pages/SecretariaAlunos.tsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAlunosByTurma,
  getTurmaById,
  updateAlunoStatus,
  AlunoDTO,
} from "@/api/secretaria";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SecretariaAlunos() {
  const { turmaId } = useParams<{ turmaId: string }>();
  const [alunos, setAlunos] = useState<AlunoDTO[]>([]);
  const [turmaNome, setTurmaNome] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!turmaId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [resAlunos, resTurma] = await Promise.all([
          getAlunosByTurma(turmaId),
          getTurmaById(turmaId),
        ]);
        setAlunos(resAlunos.data ?? []);
        setTurmaNome(resTurma.data?.nome ?? null);
      } catch (err) {
        console.error("❌ Erro ao carregar alunos:", err);
        toast({
          title: "Erro ao carregar alunos",
          description: "Não foi possível carregar os dados da turma.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [turmaId]);

  const handleStatusChange = async (alunoId: string, novoStatus: string) => {
    try {
      const payload =
        novoStatus === "ATIVO"
          ? { ativo: true, transferido: false, desistente: false }
          : novoStatus === "TRANSFERIDO"
          ? { ativo: false, transferido: true, desistente: false }
          : { ativo: false, transferido: false, desistente: true };

      await updateAlunoStatus(alunoId, payload);

      setAlunos((prev) =>
        prev.map((a) =>
          a._id === alunoId ? { ...a, ...payload } : a
        )
      );

      toast({
        title: "Status atualizado",
        description: `O status do aluno foi alterado para "${novoStatus}".`,
      });
    } catch (err) {
      console.error("❌ Erro ao atualizar status:", err);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível salvar a alteração.",
        variant: "destructive",
      });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Alunos da Turma {turmaNome ?? ""}
      </h1>

      {alunos.length === 0 ? (
        <p className="mt-4 text-muted-foreground">
          Nenhum aluno encontrado nesta turma.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alunos.map((a) => {
            const statusAtual = a.ativo
              ? "ATIVO"
              : a.transferido
              ? "TRANSFERIDO"
              : a.desistente
              ? "DESISTENTE"
              : "ATIVO";

            return (
              <Card key={a._id} className="hover:shadow transition-shadow">
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
                  <div>
                    <strong>Status:</strong>
                    <Select
                      defaultValue={statusAtual}
                      onValueChange={(value) =>
                        handleStatusChange(a._id, value)
                      }
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ATIVO">ATIVO</SelectItem>
                        <SelectItem value="TRANSFERIDO">TRANSFERIDO</SelectItem>
                        <SelectItem value="DESISTENTE">DESISTENTE</SelectItem>
                      </SelectContent>
                    </Select>
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
