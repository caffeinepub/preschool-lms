import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAllReports } from '../../hooks/useQueries';

export default function ReportBuilder() {
  const { data: reports = [] } = useGetAllReports();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Configuration</CardTitle>
        <CardDescription>Create and manage custom reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p>Report builder interface coming soon</p>
          <p className="text-sm mt-2">Configure filters, grouping, and metrics for custom reports</p>
        </div>
        {reports.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-medium">Existing Reports:</h4>
            {reports.map((report) => (
              <div key={report.reportName} className="p-3 border rounded-lg">
                <p className="font-medium">{report.reportName}</p>
                <p className="text-sm text-muted-foreground">
                  {report.metrics.length} metrics, {report.filters.length} filters
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
