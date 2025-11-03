// ==========================================================
// 📁 client/src/pages/SecretariaDashboard.tsx
// ----------------------------------------------------------
// Painel da Secretaria Acadêmica — versão revisada
// com exibição de taxas por turma.
// ==========================================================

import { useEffect, useState } from "react";
import { getDashboardGeral, getTaxasAprovacao } from "@/api/secretaria";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function SecretariaDashboard() {
  const [dash, setDash] = useState<any>(null);
  const [taxas, setTaxas] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const d = await getDashboardGeral();
        setDash(d?.data ?? d);

        const t = await getTaxasAprovacao();
        setTaxas(t?.data?.turmas ?? {});
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
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Painel da Secretaria</h1>

      {/* =====================================================
         🔹 Cards gerais
      ===================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total de Turmas</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold">{dash?.totalTurmas ?? 0}</div></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Total de Alunos</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold">{dash?.totalAlunos ?? 0}</div></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Alunos Ativos</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-green-600">{dash?.ativos ?? 0}</div></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Transferidos</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-blue-600">{dash?.transferidos ?? 0}</div></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Evadidos</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-red-600">{dash?.abandonos ?? dash?.desistentes ?? 0}</div></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Inativos</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-semibold text-gray-600">{inativos}</div></CardContent>
        </Card>
      </div>

      {/* =====================================================
         🔹 Taxas de aprovação por turma
      ===================================================== */}
      {Object.keys(taxas).length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Taxas de Aprovação por Turma</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(taxas).map(([turmaNome, valores]) => (
              <Card key={turmaNome}>
                <CardHeader>
                  <CardTitle>{turmaNome}</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { tipo: "Aprovação", valor: valores.aprovacao ?? 0 },
                      { tipo: "Reprovação", valor: valores.reprovacao ?? 0 },
                      { tipo: "Evasão", valor: valores.evasao ?? 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tipo" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="valor" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
