import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllForms, useGetForm, useGetEntities, useCreateEntity, useUpdateImportStatus } from '../../hooks/useQueries';
import { downloadTemplate } from '../../utils/excelWorkbook';
import { parseExcelFile, type ParsedRow } from '../../utils/excelImport';
import { exportToExcel } from '../../utils/excelExport';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function ExcelManager() {
  const [selectedForm, setSelectedForm] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<{ validRows: ParsedRow[]; invalidRows: ParsedRow[] } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: forms = [] } = useGetAllForms();
  const { data: selectedFormDef } = useGetForm(selectedForm);
  const { data: entities = [] } = useGetEntities(selectedForm);
  const createEntityMutation = useCreateEntity();
  const updateImportStatusMutation = useUpdateImportStatus();

  const handleDownloadTemplate = async () => {
    if (!selectedFormDef) {
      toast.error('Please select a form first');
      return;
    }
    try {
      await downloadTemplate(selectedFormDef);
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
      console.error(error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedFormDef) {
      toast.error('Please select a form first');
      e.target.value = '';
      return;
    }

    setUploadFile(file);
    setIsProcessing(true);
    setParseResult(null);

    try {
      const result = await parseExcelFile(file, selectedFormDef);
      setParseResult(result);

      if (result.invalidRows.length === 0) {
        toast.success(`All ${result.validRows.length} rows are valid and ready to import`);
      } else {
        toast.warning(`${result.validRows.length} valid rows, ${result.invalidRows.length} invalid rows`);
      }
    } catch (error: any) {
      toast.error(`Failed to parse file: ${error.message}`);
      setUploadFile(null);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!parseResult || !selectedFormDef || parseResult.validRows.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;
    const errors: { row: number; message: string }[] = [];

    try {
      // Import valid rows one by one
      for (const row of parseResult.validRows) {
        try {
          const dataArray: [string, string][] = Object.entries(row.data);
          await createEntityMutation.mutateAsync({
            formName: selectedForm,
            data: dataArray,
          });
          successCount++;
        } catch (error: any) {
          failCount++;
          errors.push({
            row: row.rowNumber,
            message: error.message || 'Unknown error',
          });
        }
      }

      // Update import status
      await updateImportStatusMutation.mutateAsync({
        formName: selectedForm,
        status: {
          totalRows: BigInt(parseResult.validRows.length),
          successfulRows: BigInt(successCount),
          failedRows: BigInt(failCount),
          errors: errors.map((e) => ({ row: BigInt(e.row), message: e.message })),
          timestamp: BigInt(Date.now() * 1000000),
        },
      });

      if (failCount === 0) {
        toast.success(`Successfully imported ${successCount} records`);
      } else {
        toast.warning(`Imported ${successCount} records, ${failCount} failed`);
      }

      // Clear the upload state
      setUploadFile(null);
      setParseResult(null);
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    if (!selectedFormDef) {
      toast.error('Please select a form first');
      return;
    }

    if (entities.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      await exportToExcel(selectedFormDef, entities);
      toast.success(`Exported ${entities.length} records`);
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Excel Data Manager</h2>
        <p className="text-muted-foreground">Import and export data using Excel templates</p>
      </div>

      <Alert>
        <FileSpreadsheet className="h-4 w-4" />
        <AlertTitle>Excel Workflows</AlertTitle>
        <AlertDescription>
          Download templates with current form structure, fill them with data, and upload for bulk import with validation.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="download" className="space-y-4">
        <TabsList>
          <TabsTrigger value="download">Download Templates</TabsTrigger>
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="download" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Download Excel Templates</CardTitle>
              <CardDescription>
                Get Excel templates with the current form structure for bulk data entry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Form Type</label>
                <Select value={selectedForm} onValueChange={setSelectedForm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a form..." />
                  </SelectTrigger>
                  <SelectContent>
                    {forms.map((form) => (
                      <SelectItem key={form.formName} value={form.formName}>
                        {form.formName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleDownloadTemplate} disabled={!selectedForm} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </Button>

              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Template Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Pre-configured columns based on form fields</li>
                  <li>• Field type descriptions and validation rules</li>
                  <li>• Detailed instructions sheet included</li>
                  <li>• Ready for data entry and upload</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Excel Data</CardTitle>
              <CardDescription>Upload filled Excel templates to import data with validation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Form Type</label>
                <Select value={selectedForm} onValueChange={setSelectedForm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a form..." />
                  </SelectTrigger>
                  <SelectContent>
                    {forms.map((form) => (
                      <SelectItem key={form.formName} value={form.formName}>
                        {form.formName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  {uploadFile ? `Selected: ${uploadFile.name}` : 'Choose an Excel file to upload'}
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={!selectedForm || isProcessing}
                />
                <label htmlFor="file-upload">
                  <Button asChild disabled={!selectedForm || isProcessing}>
                    <span className="gap-2">
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Choose File
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>

              {parseResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{parseResult.validRows.length + parseResult.invalidRows.length}</div>
                          <div className="text-sm text-muted-foreground">Total Rows</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{parseResult.validRows.length}</div>
                          <div className="text-sm text-muted-foreground">Valid Rows</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{parseResult.invalidRows.length}</div>
                          <div className="text-sm text-muted-foreground">Invalid Rows</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {parseResult.invalidRows.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Validation Errors Found</AlertTitle>
                      <AlertDescription>
                        {parseResult.invalidRows.length} row(s) have errors. Only valid rows will be imported.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium">Preview:</h4>
                    <ScrollArea className="h-[300px] rounded-md border">
                      <div className="p-4 space-y-2">
                        {parseResult.validRows.slice(0, 5).map((row) => (
                          <div key={row.rowNumber} className="flex items-start gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">Row {row.rowNumber}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {Object.entries(row.data)
                                  .slice(0, 3)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(', ')}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-600">Valid</Badge>
                          </div>
                        ))}
                        {parseResult.invalidRows.map((row) => (
                          <div key={row.rowNumber} className="flex items-start gap-2 p-2 rounded bg-red-50 dark:bg-red-950/20">
                            <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">Row {row.rowNumber}</div>
                              <div className="text-xs text-red-600 space-y-0.5">
                                {row.errors.map((error, i) => (
                                  <div key={i}>• {error}</div>
                                ))}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-red-600 border-red-600">Invalid</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleConfirmImport}
                      disabled={parseResult.validRows.length === 0 || isProcessing}
                      className="flex-1 gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Import {parseResult.validRows.length} Valid Row(s)
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadFile(null);
                        setParseResult(null);
                      }}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!parseResult && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Import Process</AlertTitle>
                  <AlertDescription>
                    Files will be validated before import. You'll see a preview of any errors and can choose to import valid rows only.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data to Excel</CardTitle>
              <CardDescription>Export existing data to Excel format for analysis or backup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Data Type</label>
                <Select value={selectedForm} onValueChange={setSelectedForm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose data to export..." />
                  </SelectTrigger>
                  <SelectContent>
                    {forms.map((form) => (
                      <SelectItem key={form.formName} value={form.formName}>
                        {form.formName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedForm && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="text-sm">
                    <span className="font-medium">Records available:</span>{' '}
                    <span className="text-muted-foreground">{entities.length}</span>
                  </div>
                </div>
              )}

              <Button onClick={handleExport} disabled={!selectedForm || entities.length === 0} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>

              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Export Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All records with metadata (ID, timestamps)</li>
                  <li>• Columns match form field structure</li>
                  <li>• Formatted for easy reading in Excel</li>
                  <li>• Compatible with Excel 2010+</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
