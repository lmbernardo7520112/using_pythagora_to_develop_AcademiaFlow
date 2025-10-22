import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

interface AiActivityProgressChartProps {
  activities: any[];
}

/**
 * 🔹 Gráfico analítico horizontal mostrando o progresso do professor:
 * - Pendentes x Revisadas x Total
 */
export function AiActivityProgressChart({ activities }: AiActivityProgressChartProps) {
  const data = useMemo(() => {
    const total = activities?.length || 0;
    const reviewed = activities?.filter((a) => a.validado || a.revisado)?.length || 0;
    const pending = total - reviewed;

    return [
      { name: "Pendentes", value: pending, color: "#fbbf24" },
      { name: "Revisadas", value: reviewed, color: "#22c55e" },
      { name: "Total", value: total, color: "#3b82f6" },
    ];
  }, [activities]);

  if (!activities || activities.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center mt-4">
        Nenhuma atividade gerada ainda para exibir no gráfico.
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] bg-white p-4 rounded-xl border shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-center">
        Progresso Pedagógico — IA Educacional
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 30, right: 30, top: 10, bottom: 10 }}
        >
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 14, fill: "#374151" }}
          />
          <Tooltip
            cursor={{ fill: "#f3f4f6" }}
            formatter={(value: number, name: string) => [`${value} atividades`, name]}
          />
          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            <LabelList
              dataKey="value"
              position="right"
              className="text-sm font-medium fill-gray-800"
            />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
