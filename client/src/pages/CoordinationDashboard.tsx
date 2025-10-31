// client/src/pages/CoordinationDashboard.tsx


import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AnalyticsCard } from "@/components/grades/AnalyticsCard";
import { ClassAnalytics } from "@/components/grades/ClassAnalytics";
import { AiActivityModal } from "@/components/AiActivityModal";
import { getCoordDashboard, getCoordActivities, validateActivity } from "@/api/coord"; // se for usar refresh pós-validação via modal, importar aqui ou deixar no modal
import { AiActivity } from "@/types/academic";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CoordinationDashboard() {
  const [stats, setStats] = useState<any>({});
  const [activities, setActivities] = useState<AiActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<AiActivity | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // wrappers agora retornam o payload útil "nu"
      const [dashRes, actRes] = await Promise.all([
        getCoordDashboard(),
        getCoordActivities(),
      ]);
      setStats(dashRes || {});
      setActivities(Array.isArray(actRes) ? actRes : []);
    } catch (err) {
      console.error("❌ Erro ao carregar dashboard da coordenação:", err);
      setStats({});
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const professoresAtivosCount =
    Array.isArray(stats?.professoresMaisAtivos) ? stats.professoresMaisAtivos.length : 0;

  if (loading) return <p className="p-6">Carregando painel...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Painel da Coordenação Pedagógica</h1>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Atividades Geradas"
          value={stats?.totalAtividades ?? 0}
          subtitle="Criadas por professores"
          icon={Eye}
          colorClass="text-blue-600"
        />

        <AnalyticsCard
          title="Validadas"
          value={stats?.atividadesValidadas ?? 0}
          subtitle="Com feedback da coordenação"
          icon={Eye}
          colorClass="text-green-600"
        />

        <AnalyticsCard
          title="Pendentes"
          value={stats?.pendentes ?? 0}
          subtitle="Aguardando validação"
          icon={Eye}
          colorClass="text-yellow-600"
        />

        <AnalyticsCard
          title="Professores Ativos"
          value={professoresAtivosCount}
          subtitle="Com atividades recentes"
          icon={Eye}
          colorClass="text-purple-600"
        />
      </div>

      {/* Seção de Desempenho por Turma */}
      {Array.isArray(stats?.turmasAnalytics) && stats.turmasAnalytics.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mt-8 mb-3">Distribuição Geral de Atividades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.turmasAnalytics.map((t: any) => (
              <Card key={t.turmaId || t.turmaNome}>
                <CardHeader>
                  <CardTitle>{t.turmaNome ?? "Turma sem nome"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ClassAnalytics analytics={t.analytics || {}} />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Seção de Atividades Pendentes */}
      <section>
        <h2 className="text-lg font-semibold mt-10 mb-3">Atividades Pendentes de Validação</h2>

        {activities.length === 0 ? (
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
            // 🔄 após fechar o modal, recarrega para refletir validação
            loadDashboard();
          }}
          mode="review"
          atividadeSelecionada={selectedActivity}
        />
      )}
    </div>
  );
}
