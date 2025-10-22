import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock3, Filter } from "lucide-react";

interface AiActivityListProps {
  activities: any[];
  onReview?: (activity: any) => void;
}

/**
 * 🔹 Listagem interativa de atividades geradas por IA.
 * - Exibe contadores de status (pendentes / revisadas)
 * - Permite filtragem dinâmica
 * - Mantém integração com callback onReview
 */
export function AiActivityList({ activities, onReview }: AiActivityListProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");

  // 🔸 Cálculo dos contadores
  const { total, pending, reviewed } = useMemo(() => {
    const total = activities?.length || 0;
    const reviewed = activities?.filter((a) => a.validado || a.revisado)?.length || 0;
    const pending = total - reviewed;
    return { total, pending, reviewed };
  }, [activities]);

  // 🔸 Aplicar filtro de exibição
  const filteredActivities = useMemo(() => {
    if (filter === "pending") return activities.filter((a) => !a.validado && !a.revisado);
    if (filter === "reviewed") return activities.filter((a) => a.validado || a.revisado);
    return activities;
  }, [activities, filter]);

  if (!activities || activities.length === 0) {
    return <p className="text-muted-foreground">Nenhuma atividade gerada ainda.</p>;
  }

  return (
    <div className="space-y-6">
      {/* 🔹 Cabeçalho de filtros e contadores */}
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Total: {total}
          </Badge>
          <Badge variant={pending > 0 ? "destructive" : "secondary"} className="text-sm px-3 py-1">
            Pendentes: {pending}
          </Badge>
          <Badge variant="default" className="text-sm px-3 py-1">
            Revisadas: {reviewed}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="border rounded-md px-2 py-1 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">Todas</option>
            <option value="pending">Pendentes</option>
            <option value="reviewed">Revisadas</option>
          </select>
        </div>
      </div>

      <Separator />

      {/* 🔹 Lista de atividades */}
      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <div
            key={activity._id}
            className="p-4 border rounded-lg shadow-sm bg-white flex flex-col md:flex-row justify-between items-start md:items-center"
          >
            <div className="flex flex-col space-y-1">
              <h3 className="font-semibold">
                {activity.metadata?.tema ?? "Atividade sem tema"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activity.atividades?.[0]?.titulo ?? "Sem título"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Status:{" "}
                {activity.validado || activity.revisado ? (
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Revisada
                  </span>
                ) : (
                  <span className="text-yellow-600 font-semibold flex items-center gap-1">
                    <Clock3 className="h-4 w-4" /> Pendente
                  </span>
                )}
              </p>
            </div>

            {!activity.validado && !activity.revisado && onReview && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReview(activity)}
                className="mt-2 md:mt-0"
              >
                Revisar
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
