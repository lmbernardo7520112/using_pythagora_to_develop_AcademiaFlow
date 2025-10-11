// client/src/pages/SecretariaAlunos.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAlunosByTurma, getTurmaById } from "@/api/secretaria";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SecretariaAlunos() {
  const { turmaId } = useParams<{ turmaId: string }>();
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmaNome, setTurmaNome] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!turmaId) return;
      setLoading(true);
      try {
        const [resAlunos, resTurma] = await Promise.all([
          getAlunosByTurma(turmaId),
          getTurmaById(turmaId),
        ]);
        setAlunos(resAlunos.data ?? []);
        setTurmaNome(resTurma.data?.nome ?? null);
      } catch (err) {
        console.error("Erro ao carregar alunos:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [turmaId]);

  if (loading) return <p className="p-6">Carregando alunos...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Alunos da Turma {turmaNome ?? ""}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alunos.map((a) => (
          <Card key={a._id} className="hover:shadow">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
