//client/src/components/grades/ClassAnalytics.tsx

import React from 'react';
import { ClassAnalytics as ClassAnalyticsType } from '@/types/academic';
import { AnalyticsCard } from './AnalyticsCard';
import { TrendingUp, Users, Award, CheckCircle, XCircle, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/* ============================================================
   🔹 Error Boundary - Protege o Dashboard contra falhas locais
   ============================================================ */
class ClassAnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorInfo: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ [ClassAnalytics] Erro de renderização:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-300 rounded-md bg-red-50 text-red-700 text-sm">
          <strong>Erro ao renderizar o painel analítico da turma.</strong>
          <p className="text-xs mt-1">Detalhes: {this.state.errorInfo}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🔹 Componente Principal: ClassAnalytics
   ============================================================ */
interface ClassAnalyticsProps {
  analytics: ClassAnalyticsType;
}

export function ClassAnalytics({ analytics }: ClassAnalyticsProps) {
  const average = analytics.classAverage ?? analytics.mediaTurma ?? 0;
  const approvalRate = analytics.approvalRate ?? analytics.taxaAprovacao ?? 0;
  const approved = analytics.approved ?? analytics.aprovados ?? 0;
  const failed = analytics.failed ?? analytics.reprovados ?? 0;
  const recovery = analytics.recovery ?? analytics.recuperacao ?? 0;
  const median = analytics.median ?? analytics.mediana ?? 0;
  const highPerformers = analytics.highPerformers ?? analytics.alunosAcima8 ?? 0;

  const quarterAverages = analytics.quarterAverages ?? { bim1: 0, bim2: 0, bim3: 0, bim4: 0 };

  const getAverageColor = (avg: number) => {
    if (avg >= 7.0) return 'text-green-600';
    if (avg >= 6.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 70) return 'bg-green-500';
    if (rate >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <ClassAnalyticsErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Resumo da Turma</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Média da Turma */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média da Turma</CardTitle>
              <TrendingUp className={getAverageColor(average)} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getAverageColor(average)}`}>
                {Number(average).toFixed(2)}
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {(['bim1', 'bim2', 'bim3', 'bim4'] as const).map((bim) => (
                  <div key={bim} className="flex justify-between">
                    <span>{bim.replace('bim', '')}º BIM:</span>
                    <span className="font-semibold">
                      {Number(quarterAverages[bim]).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mediana */}
          <AnalyticsCard
            title="Mediana da Turma"
            value={Number(median).toFixed(2)}
            subtitle="Valor central das notas"
            icon={Target}
            colorClass="text-blue-600"
          />

          {/* Aprovados x Reprovados */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovados vs Reprovados</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{approved}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Aprovados</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-2xl font-bold text-red-600">{failed}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Reprovados</p>
                </div>
              </div>
              {recovery > 0 && (
                <div className="mt-2 text-center">
                  <span className="text-sm text-yellow-600 font-semibold">
                    {recovery} em recuperação
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alto desempenho */}
          <AnalyticsCard
            title="Alunos com Média > 8.0"
            value={highPerformers}
            subtitle={`${(
              (highPerformers / Math.max(approved + failed + recovery, 1)) *
              100
            ).toFixed(1)}% da turma`}
            icon={Award}
            colorClass="text-purple-600"
          />

          {/* Taxa de aprovação */}
          <Card className="hover:shadow-md transition-shadow md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {Number(approvalRate).toFixed(1)}%
              </div>
              <Progress value={approvalRate} className={`mt-2 ${getProgressColor(approvalRate)}`} />
            </CardContent>
          </Card>
        </div>
      </div>
    </ClassAnalyticsErrorBoundary>
  );
}
