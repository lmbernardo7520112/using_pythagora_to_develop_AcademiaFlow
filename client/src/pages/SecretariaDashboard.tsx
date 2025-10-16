// client/src/pages/SecretariaDashboard.tsx

import { useEffect, useState } from "react";
import {
  getDashboardGeral,
  getTaxasAprovacao,
  DashboardGeralDTO as DashboardGeral,
} from "@/api/secretaria";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SecretariaDashboard() {
  const [dash, setDash] = useState<DashboardGeral | null>(null);
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

  const inativos =
    (dash?.transferidos ?? 0) + (dash?.desistentes ?? dash?.abandonos ?? 0);

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
            <CardTitle>Alunos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-green-600">
              {dash?.ativos ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alunos Transferidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-blue-600">
              {dash?.transferidos ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alunos Evadidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-red-600">
              {dash?.abandonos ?? dash?.desistentes ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alunos Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-600">{inativos}</div>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-lg font-semibold mt-6 mb-3">
          Taxas de Aprovação (por turma)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {!taxas || Object.keys(taxas).length === 0 ? (
            <p>Sem dados de taxa por enquanto.</p>
          ) : (
            Object.entries(taxas).map(([turma, info]) => (
              <Card key={turma}>
                <CardHeader>
                  <CardTitle>{turma}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Aprovados:</strong> {info.aprovados}/{info.total} (
                    {info.taxa})
                  </p>
                  <p className="text-sm text-slate-500">
                    Reprovados: {info.reprovados}
                  </p>
                  {info.taxaBim1 && (
                    <p className="text-sm mt-2">
                      <strong>Taxa Bim1:</strong> {info.taxaBim1.toFixed(2)}%
                    </p>
                  )}
                  {info.taxaBim2 && (
                    <p className="text-sm">
                      <strong>Taxa Bim2:</strong> {info.taxaBim2.toFixed(2)}%
                    </p>
                  )}
                  {info.taxaBim3 && (
                    <p className="text-sm">
                      <strong>Taxa Bim3:</strong> {info.taxaBim3.toFixed(2)}%
                    </p>
                  )}
                  {info.taxaBim4 && (
                    <p className="text-sm">
                      <strong>Taxa Bim4:</strong> {info.taxaBim4.toFixed(2)}%
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
