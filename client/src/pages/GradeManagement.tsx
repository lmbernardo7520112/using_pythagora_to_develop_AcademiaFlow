// client/src/pages/GradeManagement.tsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Student, ClassAnalytics as ClassAnalyticsType, BackendGradeInfo } from '@/types/academic';
import { getGradeData, saveAllGrades } from '@/api/grades';
import { GradeTable } from '@/components/grades/GradeTable';
import { GradeTableSkeleton } from '@/components/grades/GradeTableSkeleton';
import { ClassAnalytics } from '@/components/grades/ClassAnalytics';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// --- Funções auxiliares ---
const recalculateStudent = (student: Student): Student => {
  const { bim1, bim2, bim3, bim4 } = student;
  const grades = [bim1, bim2, bim3, bim4].filter(
    (g): g is number => g !== undefined && g !== null
  );
  const nf = grades.length > 0 ? grades.reduce((sum, g) => sum + g, 0) / grades.length : null;
  let status: Student['status'] = 'Pendente';
  if (nf !== null) {
    if (nf >= 7) status = 'Aprovado';
    else if (nf >= 5) status = 'Recuperação';
    else status = 'Reprovado';
  }
  return { ...student, nf, mg: nf, mf: nf, status };
};

const calculateClassAnalytics = (students: Student[]): ClassAnalyticsType => {
  const validGrades = students.map(s => s.nf).filter((g): g is number => g != null);
  const classAverage =
    validGrades.length > 0 ? validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length : 0;

  const quarterAverages = {
    bim1: avg(students, 'bim1'),
    bim2: avg(students, 'bim2'),
    bim3: avg(students, 'bim3'),
    bim4: avg(students, 'bim4'),
  };
  const sorted = [...validGrades].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  const approved = students.filter(s => s.status === 'Aprovado').length;
  const failed = students.filter(s => s.status === 'Reprovado').length;
  const recovery = students.filter(s => s.status === 'Recuperação').length;
  const highPerformers = students.filter(s => (s.nf ?? 0) >= 8).length;
  const approvalRate = students.length ? (approved / students.length) * 100 : 0;
  return { classAverage, quarterAverages, median, approved, failed, recovery, highPerformers, approvalRate };
};

function avg(students: Student[], field: keyof Pick<Student, 'bim1' | 'bim2' | 'bim3' | 'bim4'>) {
  const vals = students.map(s => s[field]).filter((g): g is number => g != null);
  return vals.length ? vals.reduce((s, g) => s + g, 0) / vals.length : 0;
}

export function GradeManagement() {
  // ✅ Esta linha já estava correta, mas agora funcionará como esperado 
  // devido às correções em App.tsx e ProfessorDashboard.tsx.
  const { turmaId, disciplinaId } = useParams<{ turmaId: string; disciplinaId: string }>();

  const navigate = useNavigate();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [analytics, setAnalytics] = useState<ClassAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [disciplineName, setDisciplineName] = useState('Carregando...');
  const [className, setClassName] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!disciplinaId || !turmaId) {
        console.error('❌ Missing parameters:', { turmaId, disciplinaId });
        toast({
          title: 'Erro',
          description: 'Parâmetros ausentes na URL',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        console.log('🔄 Fetching grade data for:', { turmaId, disciplinaId });
        // ✅ Agora os parâmetros estão na ordem correta (turmaId, disciplinaId) para o backend
        const data: BackendGradeInfo[] = await getGradeData(turmaId, disciplinaId);
        console.log('✅ Grade data received:', data);

        const transformed: Student[] = data.map((item, idx) => {
          const s: Student = {
            _id: item._id,
            number: idx + 1,
            name: item.nome ?? '',
            matricula: item.matricula ?? '',
            bim1: item.notas.avaliacao1 ?? null,
            bim2: item.notas.avaliacao2 ?? null,
            bim3: item.notas.avaliacao3 ?? null,
            bim4: item.notas.final ?? null,
            nf: item.media ?? null,
            mg: item.media ?? null,
            mf: item.media ?? null,
            status: item.situacao ?? 'Pendente',
            pf: item.notas.pf ?? null,
          };
          return recalculateStudent(s);
        });

        setStudents(transformed);
        setAnalytics(calculateClassAnalytics(transformed));

        // Placeholder temporário
        setDisciplineName('Disciplina');
        setClassName('Turma');
        setAcademicYear('2025');

        console.log(`✅ Loaded ${transformed.length} students`);
      } catch (err) {
        console.error('❌ Error fetching grade data:', err);
        toast({
          title: 'Erro',
          description: err instanceof Error ? err.message : 'Erro ao carregar notas',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [disciplinaId, turmaId, toast, navigate]);

  // Atualiza um aluno inteiro (compatibilidade antiga)
  const handleGradeUpdate = useCallback((updatedStudent: Student) => {
    setStudents(prev => {
      const updated = prev.map(s =>
        s._id === updatedStudent._id ? recalculateStudent(updatedStudent) : s
      );
      setAnalytics(calculateClassAnalytics(updated));
      setHasUnsavedChanges(true);
      return updated;
    });
  }, []);

  // Atualiza uma célula (usado na tabela)
  const handleCellUpdate = async (
    studentId: string,
    field: 'avaliacao1' | 'avaliacao2' | 'avaliacao3' | 'final' | 'pf',
    value: number | null
  ) => {
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s._id !== studentId) return s;
        const fieldMap = {
          avaliacao1: 'bim1',
          avaliacao2: 'bim2',
          avaliacao3: 'bim3',
          final: 'bim4',
          pf: 'pf',
        } as const;
        const key = fieldMap[field];
        const newS = { ...s, [key]: value };
        return recalculateStudent(newS);
      });
      setAnalytics(calculateClassAnalytics(updated));
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const handleSaveAll = async () => {
    if (!disciplinaId || !turmaId) {
      toast({ title: 'Erro', description: 'IDs ausentes', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Saving all grades...');
      // ✅ Ordem mantida: turmaId, disciplinaId
      await saveAllGrades(turmaId, disciplinaId, students);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      toast({ title: 'Sucesso', description: 'Notas salvas com sucesso' });
    } catch (err) {
      console.error('❌ Error saving grades:', err);
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao salvar notas',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => navigate('/');

  // --- Renderização ---
  if (loading) {
    return (
      <div className="space-y-6 pb-16">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <GradeTableSkeleton />
      </div>
    );
  }

  if (students.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <h2 className="text-2xl font-semibold text-muted-foreground">Nenhum aluno encontrado</h2>
        <Button onClick={handleBack}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Lançamento de Notas - {disciplineName}</h1>
            <p className="text-muted-foreground">
              {className} • {academicYear}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Última atualização:{' '}
                {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          <Button onClick={handleSaveAll} disabled={saving || !hasUnsavedChanges}>
            {saving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Salvar Notas
              </>
            )}
          </Button>
        </div>
      </div>

      <GradeTable students={students} onGradeUpdate={handleCellUpdate} />

      {analytics && (
        <div className="mt-8">
          <ClassAnalytics analytics={analytics} />
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
        <span>{students.length} alunos</span>
        {lastSaved && (
          <span>
            Última atualização: {lastSaved.toLocaleDateString('pt-BR')} às{' '}
            {lastSaved.toLocaleTimeString('pt-BR')}
          </span>
        )}
      </div>
    </div>
  );
}