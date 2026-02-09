import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useAddDropdownOption, useGetDropdownOptions } from '../../hooks/useQueries';
import type { DropdownOption } from '../../backend';
import { Badge } from '@/components/ui/badge';

const DROPDOWN_TYPES = ['classes', 'feeTypes', 'paymentModes', 'enquirySources', 'studentStatus'];

export default function DropdownManager() {
  const [selectedDropdown, setSelectedDropdown] = useState('classes');
  const [newValue, setNewValue] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const { mutate: addOption, isPending } = useAddDropdownOption();
  const { data: options = [] } = useGetDropdownOptions(selectedDropdown);

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue || !newDisplayName) return;

    const option: DropdownOption = {
      value: newValue,
      displayName: newDisplayName,
      parent: undefined,
    };

    addOption(
      { dropdownName: selectedDropdown, option },
      {
        onSuccess: () => {
          setNewValue('');
          setNewDisplayName('');
        },
      }
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Add Dropdown Option</CardTitle>
          <CardDescription>Add new options to dropdown lists</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddOption} className="space-y-4">
            <div className="space-y-2">
              <Label>Dropdown Type</Label>
              <div className="flex flex-wrap gap-2">
                {DROPDOWN_TYPES.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={selectedDropdown === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDropdown(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                placeholder="e.g., nursery"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="e.g., Nursery Class"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Option
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Options</CardTitle>
          <CardDescription>Options for {selectedDropdown}</CardDescription>
        </CardHeader>
        <CardContent>
          {options.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No options added yet for this dropdown
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {options.map((option, index) => (
                <Badge key={index} variant="secondary">
                  {option.displayName}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
