import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Download } from 'lucide-react';
import { useGetEntities, useGetForm } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AddEntityDialog from '../dialogs/AddEntityDialog';

export default function StudentsModule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data: students = [], isLoading } = useGetEntities('students');
  const { data: form } = useGetForm('students');

  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    return student.data.some(([_, value]) => value.toLowerCase().includes(searchLower));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Students Management</h2>
          <p className="text-muted-foreground">Manage student registrations and profiles</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Student Records</CardTitle>
              <CardDescription>View and manage all student information</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
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
            <div className="text-center py-8 text-muted-foreground">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <img
                src="/assets/generated/children-illustration.dim_300x200.jpg"
                alt="No students"
                className="mx-auto mb-4 rounded-lg opacity-50"
              />
              <p className="text-muted-foreground">
                {searchQuery ? 'No students found matching your search' : 'No students registered yet'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4" variant="outline">
                  Add Your First Student
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const name = student.data.find(([key]) => key === 'name')?.[1] || 'N/A';
                    const className = student.data.find(([key]) => key === 'class')?.[1] || 'N/A';
                    const status = student.data.find(([key]) => key === 'status')?.[1] || 'active';
                    const date = new Date(Number(student.createdAt) / 1000000).toLocaleDateString();

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-xs">{student.id.slice(0, 8)}...</TableCell>
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell>{className}</TableCell>
                        <TableCell>
                          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
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
        formName="students"
        title="Add New Student"
        description="Register a new student in the system"
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
