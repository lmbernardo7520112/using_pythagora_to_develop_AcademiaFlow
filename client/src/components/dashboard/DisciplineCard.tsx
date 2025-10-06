//client/src/components/dashboard/DisciplineCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users } from 'lucide-react';
import { DisciplineClass } from '@/types/academic';
import { useNavigate } from 'react-router-dom';

interface DisciplineCardProps {
  disciplineClass: DisciplineClass;
}

export function DisciplineCard({ disciplineClass }: DisciplineCardProps) {
  const navigate = useNavigate();

  const handleManageGrades = () => {
    console.log('Navigating to grades for:', disciplineClass._id);
    navigate(`/grades/${disciplineClass._id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/80">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">{disciplineClass.disciplineName}</CardTitle>
          </div>
        </div>
        <CardDescription className="text-sm font-medium text-muted-foreground">
          {disciplineClass.disciplineCode}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{disciplineClass.className}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Ano Letivo: <span className="font-semibold">{disciplineClass.academicYear}</span>
        </div>
        <Button onClick={handleManageGrades} className="w-full bg-primary hover:bg-primary/90">
          Gerenciar Notas
        </Button>
      </CardContent>
    </Card>
  );
}