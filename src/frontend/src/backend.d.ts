import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface EntityRecord {
    id: string;
    data: Array<[string, string]>;
    createdAt: Time;
    formName: string;
    updatedAt?: Time;
}
export type Time = bigint;
export interface DropdownOption {
    displayName: string;
    value: string;
    parent?: string;
}
export interface FormField {
    order: bigint;
    displayLabel: string;
    required: boolean;
    options?: Array<string>;
    fieldName: string;
    fieldType: Variant_Date_Textarea_Text_Checkbox_Number_Dropdown;
}
export interface ReportDefinition {
    filters: Array<{
        filterType: Variant_Date_Text_Number;
        fieldName: string;
    }>;
    metrics: Array<{
        metricType: Variant_Sum_Average_Count;
        fieldName: string;
    }>;
    reportName: string;
    groupBy?: string;
}
export interface FormDefinition {
    formName: string;
    fields: Array<FormField>;
}
export interface ImportStatus {
    errors: Array<{
        row: bigint;
        message: string;
    }>;
    totalRows: bigint;
    timestamp: Time;
    successfulRows: bigint;
    failedRows: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_Date_Text_Number {
    Date_ = "Date",
    Text = "Text",
    Number = "Number"
}
export enum Variant_Date_Textarea_Text_Checkbox_Number_Dropdown {
    Date_ = "Date",
    Textarea = "Textarea",
    Text = "Text",
    Checkbox = "Checkbox",
    Number = "Number",
    Dropdown = "Dropdown"
}
export enum Variant_Sum_Average_Count {
    Sum = "Sum",
    Average = "Average",
    Count = "Count"
}
export interface backendInterface {
    addDropdownOption(dropdownName: string, option: DropdownOption): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEntity(formName: string, data: Array<[string, string]>): Promise<string>;
    createForm(form: FormDefinition): Promise<void>;
    createReport(report: ReportDefinition): Promise<void>;
    getAllForms(): Promise<Array<FormDefinition>>;
    getAllReports(): Promise<Array<ReportDefinition>>;
    getCallerUserRole(): Promise<UserRole>;
    getDropdownOptions(dropdownName: string): Promise<Array<DropdownOption>>;
    getEntities(formName: string): Promise<Array<EntityRecord>>;
    getEntity(formName: string, id: string): Promise<EntityRecord | null>;
    getForm(formName: string): Promise<FormDefinition | null>;
    getImportStatus(formName: string): Promise<ImportStatus | null>;
    getReport(reportName: string): Promise<ReportDefinition | null>;
    isCallerAdmin(): Promise<boolean>;
    updateImportStatus(formName: string, status: ImportStatus): Promise<void>;
}
