import { Student } from '@/types/academic';
import { GradeCell } from './GradeCell';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { needsRecoveryExam } from '@/utils/gradeCalculations';

interface GradeTableRowProps {
  student: Student;
  onGradeUpdate: (studentId: string, field: string, value: number) => Promise<void>;
}

export function GradeTableRow({ student, onGradeUpdate }: GradeTableRowProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'Recuperação':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'Reprovado':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-gray-300 hover:bg-gray-400 text-gray-700';
    }
  };

  const needsRecovery = needsRecoveryExam(student.mg);

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      <td className="p-3 text-center font-medium sticky left-0 bg-background z-10">{student.number}</td>
      <td className="p-3 sticky left-12 bg-background z-10 min-w-[200px]">{student.name}</td>
      <td className="p-3">
        <GradeCell
          value={student.bim1}
          editable={true}
          onSave={(value) => onGradeUpdate(student._id, 'bim1', value)}
        />
      </td>
      <td className="p-3">
        <GradeCell
          value={student.bim2}
          editable={true}
          onSave={(value) => onGradeUpdate(student._id, 'bim2', value)}
        />
      </td>
      <td className="p-3">
        <GradeCell
          value={student.bim3}
          editable={true}
          onSave={(value) => onGradeUpdate(student._id, 'bim3', value)}
        />
      </td>
      <td className="p-3">
        <GradeCell
          value={student.bim4}
          editable={true}
          onSave={(value) => onGradeUpdate(student._id, 'bim4', value)}
        />
      </td>
      <td className="p-3">
        <GradeCell value={student.nf} editable={false} className="bg-muted" />
      </td>
      <td className="p-3">
        <GradeCell value={student.mg} editable={false} className="bg-muted" />
      </td>
      <td className="p-3">
        <GradeCell value={student.mf} editable={false} className="bg-muted" />
      </td>
      <td className="p-3 text-center">
        {student.status && (
          <Badge className={cn('font-semibold', getStatusColor(student.status))}>
            {student.status}
          </Badge>
        )}
      </td>
      <td className="p-3">
        <GradeCell
          value={student.pf}
          editable={needsRecovery}
          onSave={(value) => onGradeUpdate(student._id, 'pf', value)}
          className={!needsRecovery ? 'bg-muted' : ''}
        />
      </td>
      <td className="p-3 text-center">
        {student.finalStatus && (
          <Badge className={cn('font-semibold', getStatusColor(student.finalStatus))}>
            {student.finalStatus}
          </Badge>
        )}
      </td>
    </tr>
  );
}