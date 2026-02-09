import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Users, FileText, DollarSign, Calendar, Settings, FileSpreadsheet, BarChart3 } from 'lucide-react';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import StudentsModule from '../components/modules/StudentsModule';
import EnquiriesModule from '../components/modules/EnquiriesModule';
import FeesModule from '../components/modules/FeesModule';
import AttendanceModule from '../components/modules/AttendanceModule';
import ReportsModule from '../components/modules/ReportsModule';
import ExcelManager from '../components/excel/ExcelManager';
import AdminPanel from '../components/admin/AdminPanel';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex h-auto flex-wrap gap-2 bg-background/60 p-2">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="enquiries" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Enquiries</span>
            </TabsTrigger>
            <TabsTrigger value="fees" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Fees</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="excel" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Excel</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentsModule />
        </TabsContent>

        <TabsContent value="enquiries" className="space-y-6">
          <EnquiriesModule />
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <FeesModule />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <AttendanceModule />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsModule />
        </TabsContent>

        <TabsContent value="excel" className="space-y-6">
          <ExcelManager />
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <AdminPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
