//client/src/pages/GradeManagement.tsx


import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Student, ClassAnalytics as ClassAnalyticsType } from '@/types/academic';
import { getGradeData, saveAllGrades } from '@/api/grades';
import { GradeTable } from '@/components/grades/GradeTable';
import { GradeTableSkeleton } from '@/components/grades/GradeTableSkeleton';
import { ClassAnalytics } from '@/components/grades/ClassAnalytics';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// ✅ Funções auxiliares de cálculo (caso não existam em outro arquivo)
const recalculateStudent = (student: Student): Student => {
  const { bim1, bim2, bim3, bim4 } = student;
  
  // Calcula NF (nota final) como média dos bimestres
  const grades = [bim1, bim2, bim3, bim4].filter((g): g is number => g !== undefined && g !== null);
  const nf = grades.length > 0 ? grades.reduce((sum, g) => sum + g, 0) / grades.length : undefined;
  
  // Determina status baseado na nota final
  let status: Student['status'] = 'Pendente';
  if (nf !== undefined) {
    if (nf >= 7) status = 'Aprovado';
    else if (nf >= 5) status = 'Recuperação';
    else status = 'Reprovado';
  }
  
  return {
    ...student,
    nf,
    mg: nf,
    mf: nf,
    status,
  };
};

const calculateClassAnalytics = (students: Student[]): ClassAnalyticsType => {
  const validGrades = students
    .map(s => s.nf)
    .filter((g): g is number => g !== undefined && g !== null);

  const classAverage = validGrades.length > 0
    ? validGrades.reduce((sum, g) => sum + g, 0) / validGrades.length
    : 0;

  const calculateQuarterAvg = (quarter: keyof Pick<Student, 'bim1' | 'bim2' | 'bim3' | 'bim4'>) => {
    const grades = students
      .map(s => s[quarter])
      .filter((g): g is number => g !== undefined && g !== null);
    return grades.length > 0 ? grades.reduce((sum, g) => sum + g, 0) / grades.length : 0;
  };

  const quarterAverages = {
    bim1: calculateQuarterAvg('bim1'),
    bim2: calculateQuarterAvg('bim2'),
    bim3: calculateQuarterAvg('bim3'),
    bim4: calculateQuarterAvg('bim4'),
  };

  const sortedGrades = [...validGrades].sort((a, b) => a - b);
  const median = sortedGrades.length > 0
    ? sortedGrades[Math.floor(sortedGrades.length / 2)]
    : 0;

  const approved = students.filter(s => s.status === 'Aprovado').length;
  const failed = students.filter(s => s.status === 'Reprovado').length;
  const recovery = students.filter(s => s.status === 'Recuperação').length;
  const highPerformers = students.filter(s => (s.nf ?? 0) >= 8).length;
  const approvalRate = students.length > 0 ? (approved / students.length) * 100 : 0;

  return {
    classAverage,
    quarterAverages,
    median,
    approved,
    failed,
    recovery,
    highPerformers,
    approvalRate,
  };
};

export function GradeManagement() {
  // ✅ CORREÇÃO CRÍTICA: Extrair AMBOS os parâmetros da URL
  const { disciplinaId, turmaId } = useParams<{ 
    disciplinaId: string; 
    turmaId: string;
  }>();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [analytics, setAnalytics] = useState<ClassAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // ✅ Estados para info da disciplina/turma
  const [disciplineName, setDisciplineName] = useState<string>('Carregando...');
  const [className, setClassName] = useState<string>('');
  const [academicYear, setAcademicYear] = useState<string>('');

  useEffect(() => {
    const fetchGradeData = async () => {
      // ✅ VALIDAÇÃO: Verificar se ambos os IDs existem
      if (!disciplinaId || !turmaId) {
        console.error('❌ Missing parameters:', { disciplinaId, turmaId });
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
        
        // ✅ CORREÇÃO: Passar turmaId e disciplinaId na ordem correta
        const data = await getGradeData(turmaId, disciplinaId);
        
        console.log('✅ Grade data received:', data);

        // ✅ Transformar dados do backend para o formato do frontend
        const transformedStudents: Student[] = data.map((item, index) => {
          const student: Student = {
            _id: item._id,
            number: index + 1,
            name: item.nome,
            bim1: item.notas.avaliacao1 ?? undefined,
            bim2: item.notas.avaliacao2 ?? undefined,
            bim3: item.notas.avaliacao3 ?? undefined,
            bim4: item.notas.final ?? undefined,
            nf: item.media ?? undefined,
            mg: item.media ?? undefined,
            mf: item.media ?? undefined,
            status: item.situacao ?? 'Pendente',
          };
          return recalculateStudent(student);
        });

        setStudents(transformedStudents);
        setAnalytics(calculateClassAnalytics(transformedStudents));
        
        // TODO: Buscar informações da disciplina/turma se necessário
        setDisciplineName('Disciplina'); // Placeholder
        setClassName('Turma'); // Placeholder
        setAcademicYear('2025'); // Placeholder

        console.log('✅ Grade data loaded:', transformedStudents.length, 'students');
      } catch (error: unknown) {
        console.error('❌ Error fetching grade data:', error);
        toast({
          title: 'Erro',
          description: error instanceof Error ? error.message : 'Erro ao carregar notas',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGradeData();
  }, [disciplinaId, turmaId, toast, navigate]);

  const handleGradeUpdate = useCallback(
    (updatedStudent: Student) => {
      setStudents((prevStudents) => {
        const updatedStudents = prevStudents.map((student) =>
          student._id === updatedStudent._id ? recalculateStudent(updatedStudent) : student
        );
        setAnalytics(calculateClassAnalytics(updatedStudents));
        setHasUnsavedChanges(true);
        return updatedStudents;
      });
    },
    []
  );

  const handleSaveAll = async () => {
    if (!disciplinaId || !turmaId) {
      toast({
        title: 'Erro',
        description: 'IDs ausentes',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Saving all grades...');
      
      // ✅ CORREÇÃO: Passar turmaId e disciplinaId na ordem correta
      await saveAllGrades(turmaId, disciplinaId, students);
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      toast({
        title: 'Sucesso',
        description: 'Todas as notas foram salvas com sucesso',
      });
    } catch (error: unknown) {
      console.error('❌ Error saving all grades:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar notas',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    console.log('⬅️ Navigating back to dashboard');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Lançamento de Notas - {disciplineName}
            </h1>
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
                Última atualização: {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          <Button onClick={handleSaveAll} disabled={saving || !hasUnsavedChanges}>
            {saving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Notas
              </>
            )}
          </Button>
        </div>
      </div>

      <GradeTable students={students} onUpdateStudent={handleGradeUpdate} />

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