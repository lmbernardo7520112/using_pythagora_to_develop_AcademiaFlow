import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function GradeTableSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-16"><Skeleton className="h-4 w-8 mx-auto" /></TableHead>
            <TableHead className="min-w-[200px]"><Skeleton className="h-4 w-32" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
            <TableHead><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12 mx-auto" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12 mx-auto" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12 mx-auto" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20 mx-auto" /></TableHead>
            <TableHead><Skeleton className="h-4 w-12 mx-auto" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20 mx-auto" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-40" /></TableCell>
              <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
              <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}