//client/src/pages/ProfessorDashboard.tsx

import { useEffect, useState } from 'react';
import { getProfessorDisciplines } from '@/api/disciplines';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, BookOpenText, Users, Mail, CalendarDays } from 'lucide-react'; // Novos ícones
import { useToast } from '@/hooks/useToast';
import { Link } from 'react-router-dom';
import { ProfessorDisciplineWithTurmas } from '@/types/academic';
import { DisciplineCardSkeleton } from '@/components/dashboard/DisciplineCardSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Para o DisciplineCard
import { Button } from '@/components/ui/button'; // Para o botão Gerenciar Notas
import { Separator } from '@/components/ui/separator'; // Para o separador
import { cn } from '@/lib/utils'; // Para classes utilitárias

// ✅ Componente DisciplineCard Corrigido para incluir o Link e usar o tipo correto
interface DisciplineCardProps {
  discipline: ProfessorDisciplineWithTurmas; // Recebe a disciplina com turmas
}

function DisciplineCard({ discipline }: DisciplineCardProps) {
  return (
    <Card className="
      w-full max-w-sm mx-auto 
      shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out 
      border-2 border-gray-200 dark:border-gray-800 
      rounded-xl overflow-hidden 
      transform hover:scale-105
      flex flex-col {/* Adicionado flex-col para o layout interno */}
    ">
      <CardHeader className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-6 pb-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <BookOpenText className="h-7 w-7 text-white/90" />
            <CardTitle className="text-2xl font-extrabold tracking-tight">
              {discipline.nome} ({discipline.codigo})
            </CardTitle>
          </div>
          <GraduationCap className="h-8 w-8 text-white/70" />
        </div>
        <CardDescription className="text-blue-100 text-sm mt-2 flex items-center gap-1">
          <Mail className="h-4 w-4 mr-1 inline-block" /> Professor: <span className="font-semibold">{discipline.professorName}</span>
        </CardDescription>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20"></div>
      </CardHeader>
      <CardContent className="p-6 flex-grow flex flex-col justify-between"> {/* flex-grow para ocupar espaço */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" /> Turmas:
          </h3>
          {discipline.turmas.length > 0 ? (
            <ul className="space-y-3">
              {discipline.turmas.map((turma) => (
                <li key={turma._id} className="flex items-center justify-between group">
                  <span className="text-gray-700 dark:text-gray-300 text-base font-medium">
                    {turma.nome} ({turma.ano})
                  </span>
                  <Link
                    to={`/grades/${turma._id}/${discipline._id}`} // ✅ CORREÇÃO: Ordem dos IDs e usar discipline._id para a disciplina
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="
                        text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 
                        transition-colors duration-200 group-hover:underline
                      "
                    >
                      Gerenciar Notas
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">Nenhuma turma associada a esta disciplina.</p>
          )}
        </div>
        
        <Separator className="mt-auto mb-4 bg-gray-200 dark:bg-gray-700" /> {/* Separator no final */}
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Atualizado em: {new Date().toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}


export function ProfessorDashboard() {
  const [professorDisciplines, setProfessorDisciplines] = useState<ProfessorDisciplineWithTurmas[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        console.log('Fetching professor disciplines...');
        const response = await getProfessorDisciplines();
        
        if (Array.isArray(response.data)) {
            setProfessorDisciplines(response.data);
            console.log('Disciplines loaded:', response.data.length);
        } else {
            console.error('API response format unexpected:', response);
            toast({
                title: 'Erro',
                description: 'Formato de resposta da API de disciplinas inesperado.',
                variant: 'destructive',
            });
            setProfessorDisciplines([]);
        }

      } catch (error: unknown) {
        console.error('Error fetching disciplines:', error);
        toast({
          title: 'Erro',
          description: error instanceof Error ? error.message : 'Erro ao carregar disciplinas',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDisciplines();
  }, [toast]);

  const totalTurmas = professorDisciplines.reduce((acc, discipline) => acc + discipline.turmas.length, 0);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Dashboard do Professor</h1>
          <p className="text-muted-foreground">Bem-vindo, {currentUser?.email || 'Professor'}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <DisciplineCardSkeleton key={i} />
          ))}
        </div>
      ) : totalTurmas === 0 ? (
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
          {professorDisciplines.map((discipline) => (
            <DisciplineCard key={discipline._id} discipline={discipline} /> 
          ))}
        </div>
      )}
    </div>
  );
}