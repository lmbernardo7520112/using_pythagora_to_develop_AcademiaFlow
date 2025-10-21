// client/src/components/ai/AiActivityList.tsx
import { Button } from "@/components/ui/button";

interface AiActivityListProps {
  activities: any[];
  onReview?: (activity: any) => void; // ✅ Adicionado
}

export function AiActivityList({ activities, onReview }: AiActivityListProps) {
  if (!activities || activities.length === 0) {
    return <p className="text-muted-foreground">Nenhuma atividade gerada ainda.</p>;
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity._id}
          className="p-4 border rounded-lg shadow-sm bg-white flex flex-col md:flex-row justify-between"
        >
          <div>
            <h3 className="font-semibold">{activity.metadata?.tema ?? "Atividade sem tema"}</h3>
            <p className="text-sm text-muted-foreground">
              {activity.atividades?.[0]?.titulo ?? "Sem título"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Status:{" "}
              {activity.validado ? (
                <span className="text-green-600 font-semibold">Revisada</span>
              ) : (
                <span className="text-yellow-600 font-semibold">Pendente</span>
              )}
            </p>
          </div>

          {!activity.validado && onReview && (
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
  );
}

