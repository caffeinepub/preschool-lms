import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, TrendingUp, Users } from 'lucide-react';
import { useGetAllReports } from '../../hooks/useQueries';

export default function ReportsModule() {
  const { data: reports = [], isLoading } = useGetAllReports();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">Generate custom reports and view analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 mb-2">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Student Report</CardTitle>
            <CardDescription>Comprehensive student enrollment and demographics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Generate Report</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 mb-2">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>Enquiry Report</CardTitle>
            <CardDescription>Track enquiry sources and conversion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Generate Report</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 mb-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Fee Collection Report</CardTitle>
            <CardDescription>Payment tracking and outstanding fees analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Generate Report</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 mb-2">
              <BarChart3 className="h-6 w-6 text-pink-600" />
            </div>
            <CardTitle>Attendance Report</CardTitle>
            <CardDescription>Daily, weekly, and monthly attendance statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Generate Report</Button>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading custom reports...
          </CardContent>
        </Card>
      ) : reports.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Custom Reports</CardTitle>
            <CardDescription>Your configured custom reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.map((report) => (
                <div key={report.reportName} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{report.reportName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.metrics.length} metrics, {report.filters.length} filters
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Run Report</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
