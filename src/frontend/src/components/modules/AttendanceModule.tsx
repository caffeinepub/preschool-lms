import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Download, Calendar as CalendarIcon } from 'lucide-react';
import { useGetEntities } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AddEntityDialog from '../dialogs/AddEntityDialog';

export default function AttendanceModule() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data: attendance = [], isLoading } = useGetEntities('attendance');

  const filteredAttendance = attendance.filter(record => {
    const searchLower = searchQuery.toLowerCase();
    return record.data.some(([_, value]) => value.toLowerCase().includes(searchLower));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
          <p className="text-muted-foreground">Track daily student attendance</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Mark Attendance
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>View and manage attendance history</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search attendance..."
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
            <div className="text-center py-8 text-muted-foreground">Loading attendance...</div>
          ) : filteredAttendance.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No attendance records found matching your search' : 'No attendance records yet'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4" variant="outline">
                  Mark Today's Attendance
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map((record) => {
                    const date = record.data.find(([key]) => key === 'date')?.[1] || 'N/A';
                    const studentName = record.data.find(([key]) => key === 'studentName')?.[1] || 'N/A';
                    const status = record.data.find(([key]) => key === 'status')?.[1] || 'present';
                    const notes = record.data.find(([key]) => key === 'notes')?.[1] || '';

                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{date}</TableCell>
                        <TableCell>{studentName}</TableCell>
                        <TableCell>
                          <Badge variant={status === 'present' ? 'default' : 'destructive'}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{notes || '-'}</TableCell>
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
        formName="attendance"
        title="Mark Attendance"
        description="Record student attendance for today"
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
