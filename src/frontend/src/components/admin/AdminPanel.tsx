import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, FileText, List, BarChart3 } from 'lucide-react';
import FormBuilder from './FormBuilder';
import DropdownManager from './DropdownManager';
import ReportBuilder from './ReportBuilder';

export default function AdminPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Configuration</h2>
        <p className="text-muted-foreground">Manage forms, dropdowns, and system settings</p>
      </div>

      <Tabs defaultValue="forms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forms" className="gap-2">
            <FileText className="h-4 w-4" />
            Forms
          </TabsTrigger>
          <TabsTrigger value="dropdowns" className="gap-2">
            <List className="h-4 w-4" />
            Dropdowns
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms">
          <FormBuilder />
        </TabsContent>

        <TabsContent value="dropdowns">
          <DropdownManager />
        </TabsContent>

        <TabsContent value="reports">
          <ReportBuilder />
        </TabsContent>

        <TabsContent value="settings">
          <div className="text-center py-12 text-muted-foreground">
            System settings coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
