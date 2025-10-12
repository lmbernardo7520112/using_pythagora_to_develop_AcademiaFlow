// client/src/components/RelatorioChart.tsx
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type Props = {
  data: { turma: string; aprovados: number; reprovados: number; total: number; taxa: string }[];
};

export default function RelatorioChart({ data }: Props) {
  const formatted = data.map((d) => ({
    turma: d.turma,
    aprovados: d.aprovados,
    reprovados: d.reprovados,
  }));

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="turma" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="aprovados" name="Aprovados" stackId="a" />
          <Bar dataKey="reprovados" name="Reprovados" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
