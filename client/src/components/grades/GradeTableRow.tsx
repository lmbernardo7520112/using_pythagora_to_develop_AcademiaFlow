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
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  const needsRecovery = student.mg ? needsRecoveryExam(student.mg) : false;
  const displayName = student.name || (student as any).nome || 'Sem nome';

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
        <GradeCell value={student.nf} editable={false} className="bg-muted" onSave={async () => {}} />
      </td>
      <td className="p-3">
        <GradeCell value={student.mg} editable={false} className="bg-muted" onSave={async () => {}} />
      </td>
      <td className="p-3">
        <GradeCell value={student.mf} editable={false} className="bg-muted" onSave={async () => {}} />
      </td>
      <td className="p-3 text-center">
        <Badge className={cn('font-semibold', getStatusColor(student.status))}>
          {student.status || 'Pendente'}
        </Badge>
      </td>
      <td className="p-3">
        <GradeCell
          value={student.pf}
          editable={needsRecovery}
          onSave={value => onGradeUpdate(student._id, 'pf', value)}
          className={!needsRecovery ? 'bg-muted' : ''}
        />
      </td>
      <td className="p-3 text-center">
        <Badge className={cn('font-semibold', getStatusColor(student.finalStatus))}>
          {student.finalStatus || (needsRecovery ? 'Aguardando PF' : 'N/A')}
        </Badge>
      </td>
    </tr>
  );
}
