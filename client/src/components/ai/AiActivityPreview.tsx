// client/src/components/ai/AiActivityPreview.tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AiActivityPreviewProps {
  atividade: any;
}

/**
 * 🔍 Componente responsável por exibir uma atividade gerada pela IA de forma detalhada.
 * Exibe título, enunciado, alternativas, resposta correta e explicação.
 */
export const AiActivityPreview: React.FC<AiActivityPreviewProps> = ({ atividade }) => {
  if (!atividade) return null;

  return (
    <Card className="my-4 shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{atividade.titulo}</CardTitle>
          <Badge variant="secondary">{atividade.nivel_dificuldade}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Enunciado */}
        {atividade.enunciado && (
          <p className="text-gray-800">
            <strong>Enunciado:</strong> {atividade.enunciado}
          </p>
        )}

        {/* Alternativas */}
        {atividade.alternativas && (
          <div>
            <strong>Alternativas:</strong>
            <ol className="list-decimal ml-6 space-y-1">
              {atividade.alternativas.map((alt: string, i: number) => (
                <li key={i}>{alt}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Resposta correta */}
        {atividade.resposta_correta && (
          <p>
            <strong>Resposta correta:</strong> {atividade.resposta_correta}
          </p>
        )}

        {/* Explicação */}
        {atividade.explicacao && (
          <p className="text-gray-700 italic">
            <strong>Explicação:</strong> {atividade.explicacao}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
