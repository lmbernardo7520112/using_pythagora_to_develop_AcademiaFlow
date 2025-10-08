//client/src/components/grades/Gradecell.tsx


import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateGrade } from '@/utils/gradeCalculations';

interface GradeCellProps {
  value?: number | null;
  editable: boolean;
  onSave: (value: number | null) => Promise<void> | void;
  className?: string;
}

export function GradeCell({ value, editable, onSave, className }: GradeCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value != null ? value.toString() : '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(value != null ? value.toString() : '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => editable && setIsEditing(true);

  const handleBlur = () => {
    const original = value != null ? value.toString() : '';
    if (inputValue === original) {
      setIsEditing(false);
      return;
    }
    if (inputValue === '') return handleSave(null);
    const validation = validateGrade(inputValue);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }
    handleSave(parseFloat(inputValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
    else if (e.key === 'Escape') {
      setInputValue(value != null ? value.toString() : '');
      setIsEditing(false);
      setError('');
    }
  };

  const handleSave = async (val: number | null) => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await onSave(val);
      setSaveStatus('success');
      setIsEditing(false);
      setError('');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setError('Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const displayValue = value != null ? value.toFixed(1) : '-';

  return (
    <div className="relative group">
      {isEditing ? (
        <div className="space-y-1">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn('h-8 text-center', error && 'border-destructive')}
            placeholder={editable ? '0.0' : '-'}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            'h-8 flex items-center justify-center rounded-md transition-all',
            editable && 'cursor-pointer hover:bg-primary/10',
            !editable && 'bg-muted',
            saveStatus === 'success' && 'bg-green-100',
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
