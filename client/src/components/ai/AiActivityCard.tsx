//client/src/components/ai/AiActivityCard.tsx
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAiActivities } from "@/hooks/useAiActivities";

export function AiActivityCard({ atividade }: { atividade: any }) {
  const { markReviewed, deleteActivity } = useAiActivities();

  return (
    <Card className="shadow-sm border-l-4 border-primary hover:shadow-md transition-all">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>{atividade.metadata.tema}</CardTitle>
        <Badge variant={atividade.revisado ? "secondary" : "default"}>
          {atividade.revisado ? "Revisada" : "Nova"}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        {atividade.atividades.map((a: any, i: number) => (
          <div key={i}>
            <h3 className="font-semibold">{a.titulo}</h3>
            <p className="text-muted-foreground">{a.enunciado}</p>
            {a.alternativas?.length > 0 && (
              <ul className="list-disc ml-6 mt-1 text-sm">
                {a.alternativas.map((alt: string, idx: number) => (
                  <li key={idx}>{alt}</li>
                ))}
              </ul>
            )}
            <p className="text-sm mt-1">
              <strong>Resposta:</strong> {a.resposta_correta}
            </p>
            <p className="text-xs text-muted-foreground">{a.explicacao}</p>
          </div>
        ))}
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        {!atividade.revisado && (
          <Button variant="outline" size="sm" onClick={() => markReviewed(atividade._id)}>
            Revisar
          </Button>
        )}
        <Button variant="destructive" size="sm" onClick={() => deleteActivity(atividade._id)}>
          Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}
