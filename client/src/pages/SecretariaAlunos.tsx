// client/src/pages/SecretariaAlunos.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAlunosByTurma, getTurmaById } from "@/api/secretaria";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SecretariaAlunos() {
  const { turmaId } = useParams<{ turmaId: string }>();
  const navigate = useNavigate();

  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmaNome, setTurmaNome] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                <CardTitle>{a.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Matrícula:</strong> {a.matricula}
                </p>
                <p>
                  <strong>Email:</strong> {a.email}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={a.ativo ? "text-green-600" : "text-gray-500"}>
                    {a.ativo ? "Ativo" : "Inativo"}
                  </span>
                </p>
                {a.transferido && (
                  <p className="text-yellow-600">
                    <strong>Transferido</strong>
                  </p>
                )}
                {a.desistente && (
                  <p className="text-red-600">
                    <strong>Desistente</strong>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
