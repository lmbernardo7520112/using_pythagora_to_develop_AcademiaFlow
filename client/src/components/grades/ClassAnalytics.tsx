//client/src/components/grades/ClassAnalytics.tsx
import { ClassAnalytics as ClassAnalyticsType } from '@/types/academic';
import { AnalyticsCard } from './AnalyticsCard';
import { TrendingUp, Users, Award, CheckCircle, XCircle, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClassAnalyticsProps {
  analytics: ClassAnalyticsType;
}

export function ClassAnalytics({ analytics }: ClassAnalyticsProps) {
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Resumo da Turma</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média da Turma</CardTitle>
            <TrendingUp className={getAverageColor(analytics.classAverage)} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getAverageColor(analytics.classAverage)}`}>
              {analytics.classAverage.toFixed(2)}
            </div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>1º BIM:</span>
                <span className="font-semibold">{analytics.quarterAverages.bim1.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>2º BIM:</span>
                <span className="font-semibold">{analytics.quarterAverages.bim2.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>3º BIM:</span>
                <span className="font-semibold">{analytics.quarterAverages.bim3.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>4º BIM:</span>
                <span className="font-semibold">{analytics.quarterAverages.bim4.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <AnalyticsCard
          title="Mediana da Turma"
          value={analytics.median.toFixed(2)}
          subtitle="Valor central das notas"
          icon={Target}
          colorClass="text-blue-600"
        />

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
                  <span className="text-2xl font-bold text-green-600">{analytics.approved}</span>
                </div>
                <p className="text-xs text-muted-foreground">Aprovados</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-2xl font-bold text-red-600">{analytics.failed}</span>
                </div>
                <p className="text-xs text-muted-foreground">Reprovados</p>
              </div>
            </div>
            {analytics.recovery > 0 && (
              <div className="mt-2 text-center">
                <span className="text-sm text-yellow-600 font-semibold">
                  {analytics.recovery} em recuperação
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <AnalyticsCard
          title="Alunos com Média > 8.0"
          value={analytics.highPerformers}
          subtitle={`${((analytics.highPerformers / (analytics.approved + analytics.failed + analytics.recovery)) * 100).toFixed(1)}% da turma`}
          icon={Award}
          colorClass="text-purple-600"
        />

        <Card className="hover:shadow-md transition-shadow md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{analytics.approvalRate}%</div>
            <Progress value={analytics.approvalRate} className={`mt-2 ${getProgressColor(analytics.approvalRate)}`} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}