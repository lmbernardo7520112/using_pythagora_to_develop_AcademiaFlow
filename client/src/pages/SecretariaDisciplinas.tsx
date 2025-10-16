//client/src/pages/SecretariaDisciplinas.tsx

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/useToast";
import { User, BookOpen, Users, Unlink } from "lucide-react";
import {
  getDisciplines,
  assignProfessor,
  assignTurma,
  removeProfessor,
  removeTurma,
  DisciplinaDTO,
} from "@/api/secretaria";
import { ModalAssignProfessor } from "@/components/ModalAssignProfessor";
import { ModalAssignTurma } from "@/components/ModalAssignTurma";

export function SecretariaDisciplinas() {
  const [disciplinas, setDisciplinas] = useState<DisciplinaDTO[]>([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState<DisciplinaDTO | null>(null);
  const [modalType, setModalType] = useState<"professor" | "turma" | null>(null);
  const { toast } = useToast();

  async function loadData() {
    try {
      const res = await getDisciplines();
      setDisciplinas(res.data);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar disciplinas",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("disciplinasUpdate", handleUpdate);
    return () => window.removeEventListener("disciplinasUpdate", handleUpdate);
  }, []);

  function openModal(type: "professor" | "turma", disciplina: DisciplinaDTO) {
    setSelectedDisciplina(disciplina);
    setModalType(type);
  }

  function closeModal() {
    setModalType(null);
    setSelectedDisciplina(null);
  }

  async function handleAssignProfessor(professorId: string) {
    if (!selectedDisciplina) return;
    await assignProfessor(selectedDisciplina._id, professorId);
    toast({ title: "Professor atribuído com sucesso" });
    window.dispatchEvent(new Event("disciplinasUpdate"));
    closeModal();
  }

  async function handleAssignTurma(turmaId: string) {
    if (!selectedDisciplina) return;
    await assignTurma(selectedDisciplina._id, turmaId);
    toast({ title: "Turma vinculada com sucesso" });
    window.dispatchEvent(new Event("disciplinasUpdate"));
    closeModal();
  }

  async function handleRemoveProfessor(id: string) {
    await removeProfessor(id);
    toast({ title: "Professor desvinculado" });
    window.dispatchEvent(new Event("disciplinasUpdate"));
  }

  async function handleRemoveTurma(id: string) {
    await removeTurma(id);
    toast({ title: "Turma desvinculada" });
    window.dispatchEvent(new Event("disciplinasUpdate"));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <BookOpen className="h-7 w-7 text-primary" /> Gerenciamento de Disciplinas
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {disciplinas.map((disc) => (
          <Card key={disc._id} className="shadow-md border rounded-xl">
            <CardHeader className="bg-primary/10">
              <CardTitle>{disc.nome}</CardTitle>
              <CardDescription>{disc.codigo}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User /> {disc.professor?.nome || "Sem professor"}
                </span>
                <Button variant="outline" size="sm" onClick={() => openModal("professor", disc)}>
                  Atribuir
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users /> {disc.turma?.nome || "Sem turma"}
                </span>
                <Button variant="outline" size="sm" onClick={() => openModal("turma", disc)}>
                  Vincular
                </Button>
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleRemoveProfessor(disc._id)}>
                  <Unlink className="h-4 w-4 mr-1" /> Desvincular Prof.
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveTurma(disc._id)}>
                  <Unlink className="h-4 w-4 mr-1" /> Desvincular Turma
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🔹 Modais */}
      <ModalAssignProfessor
        open={modalType === "professor"}
        onClose={closeModal}
        onConfirm={handleAssignProfessor}
      />
      <ModalAssignTurma
        open={modalType === "turma"}
        onClose={closeModal}
        onConfirm={handleAssignTurma}
      />
    </div>
  );
}
