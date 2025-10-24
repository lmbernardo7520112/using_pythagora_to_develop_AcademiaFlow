// client/src/components/ai/AiActivityList.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit3, Trash2 } from "lucide-react";

export const AiActivityList = ({ activities, onReview }: any) => {
  const navigate = useNavigate();

  if (!activities?.length) {
    return <p className="text-center text-gray-500">Nenhuma atividade gerada ainda.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {activities.map((a: any) => (
        <Card key={a._id} className="shadow-md">
          <CardHeader>
            <CardTitle>{a.metadata?.tema || "Atividade Sem Título"}</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-gray-500">
              {a.metadata?.disciplina || "Disciplina não especificada"}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(a.metadata?.timestamp).toLocaleString()}
            </p>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(`/professor/atividades/${a._id}`)}>
              <Eye className="mr-2 h-4 w-4" /> Ver Atividade
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onReview(a)}>
                <Edit3 className="mr-2 h-4 w-4" /> Revisar
              </Button>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
