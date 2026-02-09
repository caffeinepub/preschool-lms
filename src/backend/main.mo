import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Option "mo:core/Option";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Migration "migration";
import Int "mo:core/Int";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  include MixinStorage();

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

  module FormDefinition {
    public func compare(form1 : FormDefinition, form2 : FormDefinition) : Order.Order {
      Text.compare(form1.formName, form2.formName);
    };
  };

  type DropdownOption = {
    value : Text;
    displayName : Text;
    parent : ?Text;
  };

  module DropdownOption {
    public func compare(option1 : DropdownOption, option2 : DropdownOption) : Order.Order {
      switch (Text.compare(option1.displayName, option2.displayName)) {
        case (#equal) { Text.compare(option1.value, option2.value) };
        case (order) { order };
      };
    };
  };

  type ReportDefinition = {
    reportName : Text;
    filters : [{ fieldName : Text; filterType : { #Text; #Number; #Date } }];
    groupBy : ?Text;
    metrics : [{ fieldName : Text; metricType : { #Sum; #Count; #Average } }];
  };

  module ReportDefinition {
    public func compare(report1 : ReportDefinition, report2 : ReportDefinition) : Order.Order {
      Text.compare(report1.reportName, report2.reportName);
    };
  };

  type EntityRecord = {
    id : Text;
    formName : Text;
    data : [(Text, Text)];
    createdAt : Time.Time;
    updatedAt : ?Time.Time;
  };

  module EntityRecord {
    public func compare(current : EntityRecord, other : EntityRecord) : Order.Order {
      switch (Int.compare(current.createdAt, other.createdAt)) {
        case (#equal) { Text.compare(current.id, other.id) };
        case (order) { order };
      };
    };
  };

  type ImportStatus = {
    totalRows : Nat;
    successfulRows : Nat;
    failedRows : Nat;
    errors : [{ row : Nat; message : Text }];
    timestamp : Time.Time;
  };

  module ImportStatus {
    public func compare(current : ImportStatus, other : ImportStatus) : Order.Order {
      switch (Int.compare(current.timestamp, other.timestamp)) {
        case (#equal) { Nat.compare(current.totalRows, other.totalRows) };
        case (order) { order };
      };
    };
  };

  let forms = Map.empty<Text, FormDefinition>();
  let dropdownOptions = Map.empty<Text, List.List<DropdownOption>>();
  let reports = Map.empty<Text, ReportDefinition>();
  let entities = Map.empty<Text, List.List<EntityRecord>>();
  let importHistory = Map.empty<Text, ImportStatus>();
  let accessControlState = AccessControl.initState();

  // Access Control
  include MixinAuthorization(accessControlState);

  // Form Management
  public shared ({ caller }) func createForm(form : FormDefinition) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can manage forms");
    };
    forms.add(form.formName, form);
  };

  public query ({ caller }) func getForm(formName : Text) : async ?FormDefinition {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view forms");
    };
    forms.get(formName);
  };

  public query ({ caller }) func getAllForms() : async [FormDefinition] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view forms");
    };
    forms.values().toArray().sort();
  };

  // Dropdown Management
  public shared ({ caller }) func addDropdownOption(dropdownName : Text, option : DropdownOption) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can manage dropdowns");
    };
    let existingOptions = switch (dropdownOptions.get(dropdownName)) {
      case (null) { List.empty<DropdownOption>() };
      case (?list) { list };
    };
    existingOptions.add(option);
    let sortedOptions = existingOptions.toArray().sort();
    dropdownOptions.add(dropdownName, List.fromArray<DropdownOption>(sortedOptions));
  };

  public query ({ caller }) func getDropdownOptions(dropdownName : Text) : async [DropdownOption] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dropdown options");
    };
    switch (dropdownOptions.get(dropdownName)) {
      case (null) { [] };
      case (?list) { list.toArray().sort() };
    };
  };

  // Entity Management
  public shared ({ caller }) func createEntity(formName : Text, data : [(Text, Text)]) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create entities");
    };
    let id = data.size().toText() # Time.now().toText();
    let record : EntityRecord = {
      id;
      formName;
      data;
      createdAt = Time.now();
      updatedAt = null;
    };

    let existingEntities = switch (entities.get(formName)) {
      case (null) { List.empty<EntityRecord>() };
      case (?list) { list };
    };
    existingEntities.add(record);
    let sortedEntities = existingEntities.toArray().sort();
    entities.add(formName, List.fromArray<EntityRecord>(sortedEntities));

    id;
  };

  public query ({ caller }) func getEntity(formName : Text, id : Text) : async ?EntityRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view entities");
    };
    switch (entities.get(formName)) {
      case (null) { null };
      case (?list) {
        list.values().find(func(record) { record.id == id });
      };
    };
  };

  public query ({ caller }) func getEntities(formName : Text) : async [EntityRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view entities");
    };
    switch (entities.get(formName)) {
      case (null) { [] };
      case (?list) { list.toArray().sort() };
    };
  };

  // Reporting
  public shared ({ caller }) func createReport(report : ReportDefinition) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can manage reports");
    };
    reports.add(report.reportName, report);
  };

  public query ({ caller }) func getReport(reportName : Text) : async ?ReportDefinition {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reports");
    };
    reports.get(reportName);
  };

  public query ({ caller }) func getAllReports() : async [ReportDefinition] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view reports");
    };
    reports.values().toArray().sort();
  };

  // Import Status
  public shared ({ caller }) func updateImportStatus(formName : Text, status : ImportStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update import status");
    };
    importHistory.add(formName, status);
  };

  public query ({ caller }) func getImportStatus(formName : Text) : async ?ImportStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view import status");
    };
    importHistory.get(formName);
  };
};
