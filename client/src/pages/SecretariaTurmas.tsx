// client/src/pages/SecretariaTurmas.tsx
import { useEffect, useState } from "react";
import { getTurmas } from "@/api/secretaria";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SecretariaTurmas() {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getTurmas();
        setTurmas(res.data ?? []);
      } catch (err) {
        console.error("Erro ao buscar turmas:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="p-6">Carregando turmas...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Turmas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {turmas.map((t) => (
          <Card key={t._id}>
            <CardHeader>
              <CardTitle>{t.nome}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Ano:</strong> {t.ano}
              </p>
              <p>
                <strong>Professor:</strong> {t.professor?.name ?? "—"}
              </p>
              <p>
                <strong>Disciplinas:</strong>{" "}
                {Array.isArray(t.disciplinas) ? t.disciplinas.map((d: { nome: any; }) => d.nome).join(", ") : "—"}
              </p>
              <div className="mt-4">
                <Button onClick={() => navigate(`/secretaria/turmas/${t._id}/alunos`)}>
                  Ver Alunos
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
