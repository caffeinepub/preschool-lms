import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateForm, useGetAllForms } from '../../hooks/useQueries';
import type { FormField, FormDefinition } from '../../backend';
import { Variant_Date_Textarea_Text_Checkbox_Number_Dropdown } from '../../backend';

export default function FormBuilder() {
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<Omit<FormField, 'order'>[]>([]);
  const { mutate: createForm, isPending } = useCreateForm();
  const { data: existingForms = [] } = useGetAllForms();

  const addField = () => {
    setFields([
      ...fields,
      {
        fieldName: '',
        displayLabel: '',
        fieldType: Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Text,
        required: false,
        options: undefined,
      },
    ]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<Omit<FormField, 'order'>>) => {
    setFields(fields.map((field, i) => (i === index ? { ...field, ...updates } : field)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || fields.length === 0) return;

    const formDefinition: FormDefinition = {
      formName,
      fields: fields.map((field, index) => ({
        ...field,
        order: BigInt(index),
      })),
    };

    createForm(formDefinition, {
      onSuccess: () => {
        setFormName('');
        setFields([]);
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Form</CardTitle>
          <CardDescription>Design custom forms for your data collection needs</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="formName">Form Name</Label>
              <Input
                id="formName"
                placeholder="e.g., students, enquiries, fees"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Form Fields</Label>
                <Button type="button" onClick={addField} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Field
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No fields added yet. Click "Add Field" to start building your form.
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="grid gap-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Field Name</Label>
                              <Input
                                placeholder="e.g., firstName"
                                value={field.fieldName}
                                onChange={(e) => updateField(index, { fieldName: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Display Label</Label>
                              <Input
                                placeholder="e.g., First Name"
                                value={field.displayLabel}
                                onChange={(e) => updateField(index, { displayLabel: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Field Type</Label>
                              <Select
                                value={field.fieldType}
                                onValueChange={(value) =>
                                  updateField(index, {
                                    fieldType: value as Variant_Date_Textarea_Text_Checkbox_Number_Dropdown,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Text}>
                                    Text
                                  </SelectItem>
                                  <SelectItem value={Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Number}>
                                    Number
                                  </SelectItem>
                                  <SelectItem value={Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Date_}>
                                    Date
                                  </SelectItem>
                                  <SelectItem value={Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Dropdown}>
                                    Dropdown
                                  </SelectItem>
                                  <SelectItem value={Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Checkbox}>
                                    Checkbox
                                  </SelectItem>
                                  <SelectItem value={Variant_Date_Textarea_Text_Checkbox_Number_Dropdown.Textarea}>
                                    Textarea
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-end gap-4">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`required-${index}`}
                                  checked={field.required}
                                  onCheckedChange={(checked) =>
                                    updateField(index, { required: checked === true })
                                  }
                                />
                                <Label htmlFor={`required-${index}`} className="text-sm font-normal">
                                  Required
                                </Label>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeField(index)}
                                variant="destructive"
                                size="icon"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={isPending || !formName || fields.length === 0} className="w-full">
              {isPending ? 'Creating Form...' : 'Create Form'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {existingForms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Forms</CardTitle>
            <CardDescription>Forms currently configured in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {existingForms.map((form) => (
                <div key={form.formName} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{form.formName}</h4>
                    <p className="text-sm text-muted-foreground">{form.fields.length} fields</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
