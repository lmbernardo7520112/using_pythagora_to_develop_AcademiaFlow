import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateGrade } from '@/utils/gradeCalculations';

interface GradeCellProps {
  value?: number;
  editable: boolean;
  onSave: (value: number) => Promise<void>;
  className?: string;
}

export function GradeCell({ value, editable, onSave, className }: GradeCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(value?.toString() || '');
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
    if (inputValue === (value?.toString() || '')) {
      setIsEditing(false);
      setError('');
      return;
    }

    if (inputValue === '') {
      setInputValue(value?.toString() || '');
      setIsEditing(false);
      setError('');
      return;
    }

    const validation = validateGrade(inputValue);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }

    handleSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value?.toString() || '');
      setIsEditing(false);
      setError('');
    }
  };

  const handleSave = async () => {
    const numValue = parseFloat(inputValue);
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await onSave(numValue);
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

  const displayValue = value !== undefined ? value.toFixed(1) : '-';

  return (
    <div className="relative group">
      {isEditing ? (
        <div className="space-y-1">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              'h-8 text-center',
              error && 'border-destructive animate-shake'
            )}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            'h-8 flex items-center justify-center rounded-md transition-all',
            editable && 'cursor-pointer hover:bg-primary/10 hover:border hover:border-primary',
            !editable && 'bg-muted',
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