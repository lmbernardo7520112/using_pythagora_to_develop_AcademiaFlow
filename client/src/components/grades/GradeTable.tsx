//client/src/components/grades/Gradetable.tsx
import { Student } from '@/types/academic';
import { GradeTableRow } from './GradeTableRow';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GradeTableProps {
  students: Student[];
  onGradeUpdate: (studentId: string, field: string, value: number) => Promise<void>;
}

export function GradeTable({ students, onGradeUpdate }: GradeTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-center font-bold sticky left-0 bg-muted/50 z-20 w-16">Nº</TableHead>
            <TableHead className="font-bold sticky left-12 bg-muted/50 z-20 min-w-[200px]">Nome do Aluno</TableHead>
            <TableHead className="text-center font-bold min-w-[100px]">1º BIM</TableHead>
            <TableHead className="text-center font-bold min-w-[100px]">2º BIM</TableHead>
            <TableHead className="text-center font-bold min-w-[100px]">3º BIM</TableHead>
            <TableHead className="text-center font-bold min-w-[100px]">4º BIM</TableHead>
            <TableHead className="text-center font-bold min-w-[100px]">NF</TableHead>
            <TableHead className="text-center font-bold min-w-[100px]">MG</TableHead>
            <TableHead className="text-center font-bold min-w-[100px]">MF</TableHead>
            <TableHead className="text-center font-bold min-w-[120px]">Situação</TableHead>
            <TableHead className="text-center font-bold min-w-[100px]">PF</TableHead>
            <TableHead className="text-center font-bold min-w-[140px]">SF</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <GradeTableRow key={student._id} student={student} onGradeUpdate={onGradeUpdate} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}