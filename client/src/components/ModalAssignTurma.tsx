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
import { Loader2 } from "lucide-react";
import { getTurmas, TurmaDTO } from "@/api/secretaria";

interface ModalAssignTurmaProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (turmaId: string) => Promise<void>;
}

export function ModalAssignTurma({ open, onClose, onConfirm }: ModalAssignTurmaProps) {
  const [turmas, setTurmas] = useState<TurmaDTO[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      getTurmas()
        .then((res) => setTurmas(res.data))
        .catch(() => setTurmas([]));
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
          <DialogTitle>Vincular Turma</DialogTitle>
        </DialogHeader>

        <div className="mt-3">
          <Select onValueChange={setSelectedId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma turma" />
            </SelectTrigger>
            <SelectContent>
              {turmas.map((t) => (
                <SelectItem key={t._id} value={t._id}>
                  {t.nome} - {t.ano}
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
