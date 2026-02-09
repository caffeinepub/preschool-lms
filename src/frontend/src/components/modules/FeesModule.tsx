import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Download } from 'lucide-react';
import { useGetEntities } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AddEntityDialog from '../dialogs/AddEntityDialog';

export default function FeesModule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data: fees = [], isLoading } = useGetEntities('fees');

  const filteredFees = fees.filter(fee => {
    const searchLower = searchQuery.toLowerCase();
    return fee.data.some(([_, value]) => value.toLowerCase().includes(searchLower));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fees Management</h2>
          <p className="text-muted-foreground">Track payments and outstanding fees</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Fee Records</CardTitle>
              <CardDescription>View and manage all fee transactions</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading fees...</div>
          ) : filteredFees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'No fee records found matching your search' : 'No fee records yet'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4" variant="outline">
                  Record Your First Payment
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.map((fee) => {
                    const studentName = fee.data.find(([key]) => key === 'studentName')?.[1] || 'N/A';
                    const amount = fee.data.find(([key]) => key === 'amount')?.[1] || '0';
                    const status = fee.data.find(([key]) => key === 'status')?.[1] || 'pending';
                    const date = new Date(Number(fee.createdAt) / 1000000).toLocaleDateString();

                    return (
                      <TableRow key={fee.id}>
                        <TableCell className="font-mono text-xs">{fee.id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{studentName}</TableCell>
                        <TableCell>${amount}</TableCell>
                        <TableCell>
                          <Badge variant={status === 'paid' ? 'default' : 'destructive'}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{date}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddEntityDialog
        formName="fees"
        title="Record Payment"
        description="Record a new fee payment"
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
