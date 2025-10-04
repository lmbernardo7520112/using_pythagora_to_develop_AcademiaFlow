import { useEffect, useState } from 'react';
import { DisciplineClass } from '@/types/academic';
import { getProfessorDisciplines } from '@/api/disciplines';
import { DisciplineCard } from '@/components/dashboard/DisciplineCard';
import { DisciplineCardSkeleton } from '@/components/dashboard/DisciplineCardSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function ProfessorDashboard() {
  const [disciplineClasses, setDisciplineClasses] = useState<DisciplineClass[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        console.log('Fetching professor disciplines...');
        const response = await getProfessorDisciplines();
        setDisciplineClasses(response.disciplineClasses);
        console.log('Disciplines loaded:', response.disciplineClasses.length);
      } catch (error: any) {
        console.error('Error fetching disciplines:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao carregar disciplinas',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDisciplines();
  }, [toast]);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Dashboard do Professor</h1>
          <p className="text-muted-foreground">Bem-vindo, {user?.name || 'Professor'}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <DisciplineCardSkeleton key={i} />
          ))}
        </div>
      ) : disciplineClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <GraduationCap className="h-24 w-24 text-muted-foreground/50" />
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Você ainda não possui disciplinas atribuídas
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            Entre em contato com o coordenador para que disciplinas sejam atribuídas a você.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {disciplineClasses.map((dc) => (
            <DisciplineCard key={dc._id} disciplineClass={dc} />
          ))}
        </div>
      )}
    </div>
  );
}