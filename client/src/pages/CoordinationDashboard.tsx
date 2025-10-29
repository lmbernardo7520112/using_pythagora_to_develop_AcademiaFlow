// client/src/pages/CoordinationDashboard.tsx

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnalyticsCard } from "@/components/grades/AnalyticsCard";
import { ClassAnalytics } from "@/components/grades/ClassAnalytics";
import { AiActivityModal } from "@/components/AiActivityModal";
import { getCoordDashboard, getCoordActivities } from "@/api/coord";
import { AiActivity } from "@/types/academic";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CoordinationDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<AiActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<AiActivity | null>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [dashRes, actRes] = await Promise.all([
          getCoordDashboard(),
          getCoordActivities(),
        ]);
        setStats(dashRes.data);
        setActivities(actRes.data);
      } catch (err) {
        console.error("Erro ao carregar dashboard da coordenação:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <p className="p-6">Carregando painel...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Painel da Coordenação Pedagógica</h1>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnalyticsCard
          title="Atividades Geradas"
          value={stats?.totalAtividades ?? 0}
          subtitle="Criadas por professores"
          icon={Eye}
          colorClass="text-blue-600"
        />

        <AnalyticsCard
          title="Atividades Validadas"
          value={stats?.atividadesValidadas ?? 0}
          subtitle="Com feedback da coordenação"
          icon={Eye}
          colorClass="text-green-600"
        />

        <AnalyticsCard
          title="Pendentes de Revisão"
          value={stats?.pendentes ?? 0}
          subtitle="Aguardando validação"
          icon={Eye}
          colorClass="text-yellow-600"
        />
      </div>

      {/* Seção de Desempenho por Turma */}
      {stats?.turmasAnalytics && (
        <section>
          <h2 className="text-lg font-semibold mt-8 mb-3">Desempenho por Turma</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.turmasAnalytics.map((t: any) => (
              <Card key={t.turmaId}>
                <CardHeader>
                  <CardTitle>{t.turmaNome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ClassAnalytics analytics={t.analytics} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Seção de Atividades Pendentes */}
      <section>
        <h2 className="text-lg font-semibold mt-10 mb-3">Atividades Pendentes de Validação</h2>

        {!activities.length ? (
          <p>Nenhuma atividade pendente no momento.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((a) => (
              <Card key={a._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{a.metadata?.tema || "Atividade sem título"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Professor:</strong> {a.professorId?.nome || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Disciplina:</strong> {a.disciplinaId?.nome || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Turma:</strong> {a.turmaId?.nome || "—"}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedActivity(a);
                      setOpenModal(true);
                    }}
                  >
                    Revisar Atividade
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Modal de Revisão */}
      {selectedActivity && (
        <AiActivityModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedActivity(null);
          }}
          mode="review"
          atividadeSelecionada={selectedActivity}
        />
      )}
    </div>
  );
}
