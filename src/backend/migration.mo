import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";

module {
  type FormField = {
    fieldName : Text;
    displayLabel : Text;
    fieldType : {
      #Text;
      #Number;
      #Dropdown;
      #Date;
      #Checkbox;
      #Textarea;
    };
    required : Bool;
    order : Nat;
    options : ?[Text];
  };

  type FormDefinition = {
    formName : Text;
    fields : [FormField];
  };

  type DropdownOption = {
    value : Text;
    displayName : Text;
    parent : ?Text;
  };

  type ReportDefinition = {
    reportName : Text;
    filters : [{ fieldName : Text; filterType : { #Text; #Number; #Date } }];
    groupBy : ?Text;
    metrics : [{ fieldName : Text; metricType : { #Sum; #Count; #Average } }];
  };

  type EntityRecord = {
    id : Text;
    formName : Text;
    data : [(Text, Text)];
    createdAt : Time.Time;
    updatedAt : ?Time.Time;
  };

  type ImportStatus = {
    totalRows : Nat;
    successfulRows : Nat;
    failedRows : Nat;
    errors : [{ row : Nat; message : Text }];
    timestamp : Time.Time;
  };

  type OldActor = {
    forms : Map.Map<Text, FormDefinition>;
    dropdownOptions : Map.Map<Text, List.List<DropdownOption>>;
    reports : Map.Map<Text, ReportDefinition>;
    entities : Map.Map<Text, List.List<EntityRecord>>;
    importHistory : Map.Map<Text, ImportStatus>;
    accessControlState : AccessControl.AccessControlState;
  };

  type NewActor = {
    forms : Map.Map<Text, FormDefinition>;
    dropdownOptions : Map.Map<Text, List.List<DropdownOption>>;
    reports : Map.Map<Text, ReportDefinition>;
    entities : Map.Map<Text, List.List<EntityRecord>>;
    importHistory : Map.Map<Text, ImportStatus>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    {
      forms = old.forms;
      dropdownOptions = old.dropdownOptions;
      reports = old.reports;
      entities = old.entities;
      importHistory = old.importHistory;
      accessControlState = old.accessControlState;
    };
  };
};
