//client/src/components/dashboard/DisciplineCardSkeleton.tsx

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DisciplineCardSkeleton() {
  return (
    <Card className="
      w-full max-w-sm mx-auto 
      shadow-lg 
      border-2 border-gray-200 dark:border-gray-800 
      rounded-xl overflow-hidden
      flex flex-col {/* Adicionado flex-col para simular o layout */}
    ">
      <CardHeader className="bg-gray-200 dark:bg-gray-800 p-6 pb-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 w-full">
            <Skeleton className="h-7 w-7 rounded-md bg-gray-300 dark:bg-gray-700" />
            <Skeleton className="h-6 w-3/4 rounded-md bg-gray-300 dark:bg-gray-700" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md bg-gray-300 dark:bg-gray-700" />
        </div>
        <Skeleton className="h-4 w-1/2 rounded-md mt-2 bg-gray-300 dark:bg-gray-700" />
      </CardHeader>
      <CardContent className="p-6 flex-grow flex flex-col justify-between">
        <div className="mb-4">
          <Skeleton className="h-5 w-24 rounded-md mb-3 bg-gray-200 dark:bg-gray-700" /> {/* "Turmas:" título */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-2/3 rounded-md bg-gray-200 dark:bg-gray-700" /> {/* Turma 1 nome */}
              <Skeleton className="h-8 w-24 rounded-md bg-gray-200 dark:bg-gray-700" /> {/* Botão 1 */}
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-2/3 rounded-md bg-gray-200 dark:bg-gray-700" /> {/* Turma 2 nome */}
              <Skeleton className="h-8 w-24 rounded-md bg-gray-200 dark:bg-gray-700" /> {/* Botão 2 */}
            </div>
          </div>
        </div>
        
        <Skeleton className="h-px w-full mt-auto mb-4 bg-gray-200 dark:bg-gray-700" /> {/* Separador */}
        <Skeleton className="h-4 w-1/3 rounded-md mx-auto bg-gray-200 dark:bg-gray-700" /> {/* Data de atualização */}
      </CardContent>
    </Card>
  );
}