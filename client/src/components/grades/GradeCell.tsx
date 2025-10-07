//client/src/components/grades/Gradecell.tsx

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateGrade } from '@/utils/gradeCalculations'; // Assumindo que validateGrade lida com vazio/null

interface GradeCellProps {
  // ✅ CORREÇÃO: 'value' pode ser 'number', 'null' ou 'undefined'
  value?: number | null; 
  editable: boolean;
  // ✅ CORREÇÃO: 'onSave' agora aceita 'number | null'
  onSave: (value: number | null) => Promise<void>; 
  className?: string;
}

export function GradeCell({ value, editable, onSave, className }: GradeCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  // ✅ CORREÇÃO: Inicializa inputValue com uma string vazia se value for null/undefined
  const [inputValue, setInputValue] = useState(value !== null && value !== undefined ? value.toString() : '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // ✅ CORREÇÃO: Atualiza inputValue se value mudar e não for null/undefined
    setInputValue(value !== null && value !== undefined ? value.toString() : '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (editable) {
      setIsEditing(true);
      setError('');
      setSaveStatus('idle');
    }
  };

  const handleBlur = () => {
    // ✅ CORREÇÃO: Comparar inputValue com o valor original (string vazia se null/undefined)
    const originalValueString = value !== null && value !== undefined ? value.toString() : '';
    if (inputValue === originalValueString) {
      setIsEditing(false);
      setError('');
      return;
    }

    if (inputValue === '') {
      // Se o campo for deixado vazio, salvamos como null
      handleSave(null); // ✅ CORREÇÃO: Chamar handleSave com null
      return;
    }

    const validation = validateGrade(inputValue);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }

    handleSave(parseFloat(inputValue)); // ✅ CORREÇÃO: Chamar handleSave com o valor parseado
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      // ✅ CORREÇÃO: Resetar para o valor original, que pode ser null/undefined
      setInputValue(value !== null && value !== undefined ? value.toString() : '');
      setIsEditing(false);
      setError('');
    }
  };

  // ✅ CORREÇÃO: 'handleSave' agora aceita 'number | null'
  const handleSave = async (gradeToSave: number | null) => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await onSave(gradeToSave); // ✅ Passa o valor (number ou null) diretamente para onSave
      setSaveStatus('success');
      setIsEditing(false);
      setError('');

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Error saving grade:', err);
      setSaveStatus('error');
      setError('Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ CORREÇÃO: Exibir '-' se o valor for null ou undefined
  const displayValue = (value !== undefined && value !== null) ? value.toFixed(1) : '-';

  return (
    <div className="relative group">
      {isEditing ? (
        <div className="space-y-1">
          <Input
            ref={inputRef}
            type="text" // Mantido como 'text' para permitir input vazio e validação customizada
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              'h-8 text-center',
              error && 'border-destructive animate-shake'
            )}
            placeholder={editable ? '0.0' : '-'} // Adicionado placeholder
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            'h-8 flex items-center justify-center rounded-md transition-all',
            editable && 'cursor-pointer hover:bg-primary/10 hover:border hover:border-primary',
            !editable && 'bg-muted', // Aplica bg-muted apenas se não for editável
            saveStatus === 'success' && 'bg-green-100 dark:bg-green-900/20',
            className
          )}
        >
          <span className="font-medium">{displayValue}</span>
          {isSaving && <Loader2 className="h-3 w-3 ml-1 animate-spin text-primary" />}
          {saveStatus === 'success' && <Check className="h-3 w-3 ml-1 text-green-600" />}
          {saveStatus === 'error' && <X className="h-3 w-3 ml-1 text-destructive" />}
        </div>
      )}
    </div>
  );
}