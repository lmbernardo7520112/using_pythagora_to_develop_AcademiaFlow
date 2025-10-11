// client/src/pages/SecretariaDashboard.tsx
import { useEffect, useState } from "react";
import { getDashboardGeral, getTaxasAprovacao } from "@/api/secretaria";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Dashboard = {
  totalTurmas: number;
  totalAlunos: number;
  inativos: number;
};

export default function SecretariaDashboard() {
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [taxas, setTaxas] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const d = await getDashboardGeral();
        setDash(d.data);

        const t = await getTaxasAprovacao();
        setTaxas(t.data?.turmas ?? {});
      } catch (err) {
        console.error("Erro ao carregar dashboard da secretaria:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="p-6">Carregando painel...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Painel da Secretaria</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Turmas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{dash?.totalTurmas ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{dash?.totalAlunos ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alunos Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-rose-600">{dash?.inativos ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-lg font-semibold mt-6 mb-3">Taxas de Aprovação (por turma)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.keys(taxas).length === 0 && <p>Sem dados de taxa por enquanto.</p>}
          {Object.entries(taxas).map(([turma, info]) => (
            <Card key={turma}>
              <CardHeader>
                <CardTitle>{turma}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Aprovados:</strong> {info.aprovados}/{info.total} ({info.taxa})
                </p>
                <p className="text-sm text-slate-500">Reprovados: {info.reprovados}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
