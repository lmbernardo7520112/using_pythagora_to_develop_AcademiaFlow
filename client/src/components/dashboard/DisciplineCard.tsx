//client/src/components/dashboard/DisciplineCard.tsx

// client/src/components/dashboard/DisciplineCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpenText, Users, GraduationCap, Mail, CalendarDays } from 'lucide-react'; // Ícones atualizados
import { DisciplineClass } from '@/types/academic'; // Agora DisciplineClass está redefinida
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils'; // Para classes utilitárias

interface DisciplineCardProps {
  disciplineClass: DisciplineClass; // Agora esta interface inclui o array 'turmas'
}

export function DisciplineCard({ disciplineClass }: DisciplineCardProps) {
  const navigate = useNavigate();

  // A função para gerenciar notas agora precisa de um ID de disciplina (disciplineClass._id)
  // e um ID de turma (passado no loop das turmas)
  const handleManageGrades = (turmaId: string, disciplineId: string) => {
    console.log(`Navigating to grades for discipline ${disciplineClass.disciplineName} (ID: ${disciplineId}) in turma (ID: ${turmaId})`);
    navigate(`/grades/${turmaId}/${disciplineId}`);
  };

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
              {disciplineClass.disciplineName} ({disciplineClass.disciplineCode})
            </CardTitle>
          </div>
          <GraduationCap className="h-8 w-8 text-white/70" />
        </div>
        <CardDescription className="text-blue-100 text-sm mt-2 flex items-center gap-1">
          <Mail className="h-4 w-4 mr-1 inline-block" /> Professor: <span className="font-semibold">{disciplineClass.professorEmail}</span>
        </CardDescription>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20"></div>
      </CardHeader>
      <CardContent className="p-6 flex-grow flex flex-col justify-between"> {/* flex-grow para ocupar espaço */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" /> Turmas:
          </h3>
          {disciplineClass.turmas && disciplineClass.turmas.length > 0 ? (
            <ul className="space-y-3">
              {disciplineClass.turmas.map((turma) => (
                <li key={turma._id} className="flex items-center justify-between group">
                  <span className="text-gray-700 dark:text-gray-300 text-base font-medium">
                    {turma.nome} ({turma.academicYear})
                  </span>
                  <Button
                    onClick={() => handleManageGrades(turma._id, disciplineClass._id)} // Passa ID da turma e ID da disciplina (que é disciplineClass._id)
                    variant="ghost"
                    size="sm"
                    className="
                      text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 
                      transition-colors duration-200 group-hover:underline
                    "
                  >
                    Gerenciar Notas
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">Nenhuma turma associada a esta disciplina.</p>
          )}
        </div>
        
        <Separator className="mt-auto mb-4 bg-gray-200 dark:bg-gray-700" />
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Atualizado em: {new Date().toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}