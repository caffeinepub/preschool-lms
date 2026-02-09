import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateEntity, useGetForm } from '../../hooks/useQueries';
import { Loader2 } from 'lucide-react';
import { Variant_Date_Textarea_Text_Checkbox_Number_Dropdown } from '../../backend';

interface AddEntityDialogProps {
  formName: string;
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddEntityDialog({
  formName,
  title,
  description,
  open,
  onOpenChange,
}: AddEntityDialogProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { data: form, isLoading: formLoading } = useGetForm(formName);
  const { mutate: createEntity, isPending } = useCreateEntity();

  useEffect(() => {
    if (form) {
      const initialData: Record<string, string> = {};
      form.fields.forEach((field) => {
        initialData[field.fieldName] = '';
      });
      setFormData(initialData);
    }
  }, [form]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: [string, string][] = Object.entries(formData);
    createEntity(
      { formName, data },
      {
        onSuccess: () => {
          onOpenChange(false);
          setFormData({});
        },
      }
    );
  };

  const updateField = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  if (formLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!form) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form Not Found</DialogTitle>
            <DialogDescription>
              The form "{formName}" needs to be created in the Admin panel first.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {form.fields
            .sort((a, b) => Number(a.order) - Number(b.order))
            .map((field) => {
              const value = formData[field.fieldName] || '';

              return (
                <div key={field.fieldName} className="space-y-2">
                  <Label htmlFor={field.fieldName}>
                    {field.displayLabel}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>

                  {field.fieldType === Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Text && (
                    <Input
                      id={field.fieldName}
                      value={value}
                      onChange={(e) => updateField(field.fieldName, e.target.value)}
                      required={field.required}
                    />
                  )}

                  {field.fieldType === Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Number && (
                    <Input
                      id={field.fieldName}
                      type="number"
                      value={value}
                      onChange={(e) => updateField(field.fieldName, e.target.value)}
                      required={field.required}
                    />
                  )}

                  {field.fieldType === Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Date_ && (
                    <Input
                      id={field.fieldName}
                      type="date"
                      value={value}
                      onChange={(e) => updateField(field.fieldName, e.target.value)}
                      required={field.required}
                    />
                  )}

                  {field.fieldType === Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Textarea && (
                    <Textarea
                      id={field.fieldName}
                      value={value}
                      onChange={(e) => updateField(field.fieldName, e.target.value)}
                      required={field.required}
                    />
                  )}

                  {field.fieldType === Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Dropdown &&
                    field.options && (
                      <Select value={value} onValueChange={(val) => updateField(field.fieldName, val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option..." />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                  {field.fieldType === Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Checkbox && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={field.fieldName}
                        checked={value === 'true'}
                        onCheckedChange={(checked) =>
                          updateField(field.fieldName, checked ? 'true' : 'false')
                        }
                      />
                      <Label htmlFor={field.fieldName} className="font-normal">
                        {field.displayLabel}
                      </Label>
                    </div>
                  )}
                </div>
              );
            })}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
