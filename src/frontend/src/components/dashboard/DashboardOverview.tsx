import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { useGetEntities } from '../../hooks/useQueries';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function DashboardOverview() {
  const { data: students = [] } = useGetEntities('students');
  const { data: enquiries = [] } = useGetEntities('enquiries');
  const { data: fees = [] } = useGetEntities('fees');
  const { data: attendance = [] } = useGetEntities('attendance');

  // Calculate KPIs
  const totalStudents = students.length;
  const totalEnquiries = enquiries.length;
  const pendingFees = fees.filter(fee => {
    const status = fee.data.find(([key]) => key === 'status')?.[1];
    return status === 'pending';
  }).length;
  const todayAttendance = attendance.filter(record => {
    const date = record.data.find(([key]) => key === 'date')?.[1];
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  }).length;

  // Chart data
  const monthlyData = [
    { month: 'Jan', students: 45, enquiries: 12 },
    { month: 'Feb', students: 52, enquiries: 18 },
    { month: 'Mar', students: 61, enquiries: 15 },
    { month: 'Apr', students: 68, enquiries: 22 },
    { month: 'May', students: 75, enquiries: 19 },
    { month: 'Jun', students: totalStudents, enquiries: totalEnquiries },
  ];

  const statusData = [
    { name: 'Active', value: totalStudents, color: 'oklch(var(--chart-1))' },
    { name: 'Pending', value: totalEnquiries, color: 'oklch(var(--chart-2))' },
    { name: 'Outstanding', value: pendingFees, color: 'oklch(var(--chart-3))' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to your preschool management dashboard</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              Active enrollments
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Enquiries</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnquiries}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              Pending follow-up
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFees}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 text-orange-600" />
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendance}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              Students present
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Students and enquiries over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="oklch(var(--chart-1))" name="Students" />
                <Bar dataKey="enquiries" fill="oklch(var(--chart-2))" name="Enquiries" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>Get started with your preschool management system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Add Students</h4>
                <p className="text-sm text-muted-foreground">Register new students and manage profiles</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold">Track Enquiries</h4>
                <p className="text-sm text-muted-foreground">Manage prospective student enquiries</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                <img src="/assets/generated/excel-icon-transparent.dim_48x48.png" alt="Excel" className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold">Import Data</h4>
                <p className="text-sm text-muted-foreground">Bulk import using Excel templates</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
