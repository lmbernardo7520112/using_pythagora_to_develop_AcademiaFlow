import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GradeData, Student, ClassAnalytics as ClassAnalyticsType } from '@/types/academic';
import { getGradeData, updateStudentGrade, saveAllGrades } from '@/api/grades';
import { GradeTable } from '@/components/grades/GradeTable';
import { GradeTableSkeleton } from '@/components/grades/GradeTableSkeleton';
import { ClassAnalytics } from '@/components/grades/ClassAnalytics';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { recalculateStudent, calculateClassAnalytics } from '@/utils/gradeCalculations';

export function GradeManagement() {
  const { disciplineClassId } = useParams<{ disciplineClassId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [gradeData, setGradeData] = useState<GradeData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [analytics, setAnalytics] = useState<ClassAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchGradeData = async () => {
      if (!disciplineClassId) return;

      try {
        console.log('Fetching grade data for:', disciplineClassId);
        const response = await getGradeData(disciplineClassId);
        setGradeData(response.gradeData);

        const recalculatedStudents = response.gradeData.students.map(recalculateStudent);
        setStudents(recalculatedStudents);
        setAnalytics(calculateClassAnalytics(recalculatedStudents));

        console.log('Grade data loaded:', recalculatedStudents.length, 'students');
      } catch (error: any) {
        console.error('Error fetching grade data:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao carregar notas',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGradeData();
  }, [disciplineClassId, toast]);

  const handleGradeUpdate = useCallback(
    async (studentId: string, field: string, value: number) => {
      if (!disciplineClassId) return;

      try {
        console.log('Updating grade:', { studentId, field, value });
        await updateStudentGrade(disciplineClassId, studentId, field, value);

        setStudents((prevStudents) => {
          const updatedStudents = prevStudents.map((student) => {
            if (student._id === studentId) {
              const updated = { ...student, [field]: value };
              return recalculateStudent(updated);
            }
            return student;
          });

          setAnalytics(calculateClassAnalytics(updatedStudents));
          return updatedStudents;
        });

        setHasUnsavedChanges(false);
        setLastSaved(new Date());

        toast({
          title: 'Sucesso',
          description: 'Nota salva com sucesso',
        });
      } catch (error: any) {
        console.error('Error updating grade:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao salvar nota',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [disciplineClassId, toast]
  );

  const handleSaveAll = async () => {
    if (!disciplineClassId) return;

    setSaving(true);
    try {
      console.log('Saving all grades...');
      await saveAllGrades(disciplineClassId, students);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      toast({
        title: 'Sucesso',
        description: 'Todas as notas foram salvas com sucesso',
      });
    } catch (error: any) {
      console.error('Error saving all grades:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar notas',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    console.log('Navigating back to dashboard');
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

  if (!gradeData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <h2 className="text-2xl font-semibold text-muted-foreground">Dados não encontrados</h2>
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
              Lançamento de Notas - {gradeData.disciplineClass.disciplineName}
            </h1>
            <p className="text-muted-foreground">
              {gradeData.disciplineClass.className} • {gradeData.disciplineClass.academicYear}
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

      <GradeTable students={students} onGradeUpdate={handleGradeUpdate} />

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