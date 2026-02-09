import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Download } from 'lucide-react';
import { useGetEntities } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AddEntityDialog from '../dialogs/AddEntityDialog';

export default function EnquiriesModule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data: enquiries = [], isLoading } = useGetEntities('enquiries');

  const filteredEnquiries = enquiries.filter(enquiry => {
    const searchLower = searchQuery.toLowerCase();
    return enquiry.data.some(([_, value]) => value.toLowerCase().includes(searchLower));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Enquiries Management</h2>
          <p className="text-muted-foreground">Track and manage prospective student enquiries</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Enquiry
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Enquiry Records</CardTitle>
              <CardDescription>View and follow up on all enquiries</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search enquiries..."
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
            <div className="text-center py-8 text-muted-foreground">Loading enquiries...</div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'No enquiries found matching your search' : 'No enquiries recorded yet'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4" variant="outline">
                  Add Your First Enquiry
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Parent Name</TableHead>
                    <TableHead>Child Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnquiries.map((enquiry) => {
                    const parentName = enquiry.data.find(([key]) => key === 'parentName')?.[1] || 'N/A';
                    const childName = enquiry.data.find(([key]) => key === 'childName')?.[1] || 'N/A';
                    const status = enquiry.data.find(([key]) => key === 'status')?.[1] || 'new';
                    const date = new Date(Number(enquiry.createdAt) / 1000000).toLocaleDateString();

                    return (
                      <TableRow key={enquiry.id}>
                        <TableCell className="font-mono text-xs">{enquiry.id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{parentName}</TableCell>
                        <TableCell>{childName}</TableCell>
                        <TableCell>
                          <Badge variant={status === 'converted' ? 'default' : 'secondary'}>
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
        formName="enquiries"
        title="Add New Enquiry"
        description="Record a new prospective student enquiry"
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
