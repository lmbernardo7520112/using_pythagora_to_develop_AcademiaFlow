import { useState, useEffect } from "react";
import { useProfessorData } from "@/hooks/useProfessorData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Filter } from "lucide-react";

interface ActivityFiltersProps {
  professorId: string;
  onFilterChange: (filters: {
    disciplinaId?: string;
    turmaId?: string;
    status?: "pendente" | "revisada" | "todas";
  }) => void;
  loading?: boolean;
}

/**
 * 🔹 Componente de filtros para o painel do professor
 * - Permite filtrar por disciplina, turma e status (pendente / revisada)
 * - Usa dados dinâmicos via hook `useProfessorData`
 */
export function ActivityFilters({ professorId, onFilterChange, loading }: ActivityFiltersProps) {
  const { disciplinas, turmas, fetchDisciplinasETurmas } = useProfessorData();
  const [selectedDisciplina, setSelectedDisciplina] = useState<string>("");
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<"pendente" | "revisada" | "todas">("todas");

  useEffect(() => {
    if (professorId) fetchDisciplinasETurmas(professorId);
  }, [professorId, fetchDisciplinasETurmas]);

  const handleApplyFilters = () => {
    onFilterChange({
      disciplinaId: selectedDisciplina || undefined,
      turmaId: selectedTurma || undefined,
      status: selectedStatus,
    });
  };

  const handleClearFilters = () => {
    setSelectedDisciplina("");
    setSelectedTurma("");
    setSelectedStatus("todas");
    onFilterChange({ status: "todas" });
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 items-center bg-card border p-4 rounded-xl shadow-sm mb-6">
      {/* 🔹 Filtro de disciplina */}
      <Select value={selectedDisciplina} onValueChange={setSelectedDisciplina}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Disciplina" />
        </SelectTrigger>
        <SelectContent>
          {disciplinas.map((d) => (
            <SelectItem key={d._id} value={d._id}>
              {d.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 🔹 Filtro de turma */}
      <Select value={selectedTurma} onValueChange={setSelectedTurma}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Turma" />
        </SelectTrigger>
        <SelectContent>
          {turmas.map((t) => (
            <SelectItem key={t._id} value={t._id}>
              {t.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 🔹 Filtro de status */}
      <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val as any)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas</SelectItem>
          <SelectItem value="pendente">Pendentes</SelectItem>
          <SelectItem value="revisada">Revisadas</SelectItem>
        </SelectContent>
      </Select>

      {/* 🔹 Botões */}
      <div className="flex gap-2">
        <Button
          onClick={handleApplyFilters}
          disabled={loading}
          className="flex items-center gap-1"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Aplicando...
            </>
          ) : (
            <>
              <Filter className="w-4 h-4" /> Filtrar
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          onClick={handleClearFilters}
          disabled={loading}
        >
          Limpar
        </Button>
      </div>
    </div>
  );
}
