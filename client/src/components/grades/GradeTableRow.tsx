//client/src/components/grades/GradeTableRow.tsx

import { Student } from '@/types/academic';
import { GradeCell } from './GradeCell';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { needsRecoveryExam } from '@/utils/gradeCalculations';

interface GradeTableRowProps {
  student: Student;
  onGradeUpdate: (
    studentId: string,
    field: 'avaliacao1' | 'avaliacao2' | 'avaliacao3' | 'final' | 'pf',
    value: number | null
  ) => Promise<void> | void;
  studentIndex: number;
}

export function GradeTableRow({ student, onGradeUpdate, studentIndex }: GradeTableRowProps) {
  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-500 text-white';
      case 'Recuperação': return 'bg-yellow-500 text-white';
      case 'Reprovado': return 'bg-red-500 text-white';
      case 'Pendente': return 'bg-gray-300 text-gray-700';
      case 'Aguardando PF': return 'bg-blue-500 text-white';
      case 'N/A': return 'bg-gray-300 text-gray-700';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  const needsRecovery = student.mg !== undefined && student.mg !== null ? needsRecoveryExam(student.mg) : false;
  const displayName = student.name || (student as any).nome || 'Sem nome';

  const sfDisplay = student.finalStatus 
    ? student.finalStatus 
    : needsRecovery && student.pf === null 
      ? 'Aguardando PF' 
      : 'N/A';

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="p-3 text-center font-medium sticky left-0 bg-background z-10">{studentIndex + 1}</td>
      <td className="p-3 sticky left-12 bg-background z-10 min-w-[200px]">{displayName}</td>

      {(['avaliacao1', 'avaliacao2', 'avaliacao3', 'final'] as const).map((field, idx) => (
        <td key={field} className="p-3">
          <GradeCell
            value={student[`bim${idx + 1}` as keyof Student] as number | null}
            editable={true}
            onSave={value => onGradeUpdate(student._id, field, value)}
          />
        </td>
      ))}

      <td className="p-3">
        <GradeCell value={student.nf ?? null} editable={false} className="bg-muted" onSave={async () => {}} />
      </td>
      <td className="p-3">
        <GradeCell value={student.mg ?? null} editable={false} className="bg-muted" onSave={async () => {}} />
      </td>
      <td className="p-3">
        <GradeCell value={student.mf ?? null} editable={false} className="bg-muted" onSave={async () => {}} />
      </td>

      <td className="p-3 text-center">
        <Badge className={cn('font-semibold', getStatusColor(student.status))}>
          {student.status || 'Pendente'}
        </Badge>
      </td>

      <td className="p-3">
        <GradeCell
          value={student.pf ?? null}
          editable={needsRecovery}
          onSave={value => onGradeUpdate(student._id, 'pf', value)}
          className={!needsRecovery ? 'bg-muted' : ''}
        />
      </td>

      <td className="p-3 text-center">
        <Badge className={cn('font-semibold', getStatusColor(sfDisplay))}>
          {sfDisplay}
        </Badge>
      </td>
    </tr>
  );
}
