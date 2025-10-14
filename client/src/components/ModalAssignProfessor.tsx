import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/api/api";
import { Loader2 } from "lucide-react";

interface ModalAssignProfessorProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (professorId: string) => Promise<void>;
}

export function ModalAssignProfessor({ open, onClose, onConfirm }: ModalAssignProfessorProps) {
  const [professores, setProfessores] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      api
        .get("/users?role=professor")
        .then((res) => setProfessores(res.data))
        .catch(() => setProfessores([]));
    }
  }, [open]);

  async function handleConfirm() {
    if (!selectedId) return;
    setLoading(true);
    await onConfirm(selectedId);
    setLoading(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir Professor</DialogTitle>
        </DialogHeader>

        <div className="mt-3">
          <Select onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um professor" />
            </SelectTrigger>
            <SelectContent>
              {professores.map((p) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.nome} ({p.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedId || loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
