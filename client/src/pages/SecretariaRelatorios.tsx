// client/src/pages/SecretariaRelatorios.tsx

import { useEffect, useState } from "react";
import { getRelatorios } from "@/api/secretaria";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

type RelatorioDTO = {
  totalTurmas: number;
  totalAlunos: number;
  mediaGeral: number;
  taxaAprovacao: number;
  desempenhoPorTurma?: { turma: string; media: number }[];
};

export default function SecretariaRelatorios() {
  const [data, setData] = useState<RelatorioDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getRelatorios();
        setData({
          ...res.data,
          desempenhoPorTurma: res.data.desempenhoPorTurma ?? [],
        });
      } catch (err) {
        console.error("Erro ao carregar relatórios:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );

  if (!data)
    return (
      <div className="text-center text-muted-foreground mt-10">
        Nenhum dado disponível no momento.
      </div>
    );

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Relatórios Acadêmicos
      </h1>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Turmas" value={data.totalTurmas} />
        <StatsCard title="Alunos" value={data.totalAlunos} />
        <StatsCard
          title="Média Geral"
          value={data.mediaGeral?.toFixed(1) ?? "—"}
          description="Média ponderada das notas"
        />
        <StatsCard
          title="Taxa de Aprovação"
          value={
            data.taxaAprovacao !== undefined
              ? `${data.taxaAprovacao.toFixed(1)}%`
              : "—"
          }
          description="Percentual de alunos aprovados"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Turma</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {data.desempenhoPorTurma?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.desempenhoPorTurma}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="turma" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="media" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-muted-foreground text-sm text-center mt-10">
              Nenhum dado de desempenho encontrado.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
