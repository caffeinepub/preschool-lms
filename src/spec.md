# Specification

## Summary
**Goal:** Make backend data survive canister upgrades, replace placeholder Excel import/export with real .xlsx template/download/upload workflows, and add a verified production deployment guide for IC mainnet.

**Planned changes:**
- Implement upgrade-safe persistent storage in the Motoko backend so forms, dropdown options, reports, entities, import history, and authorization/admin bootstrap state persist across upgrades/restarts.
- Add/adjust backend upgrade hooks (and only add a minimal migration module if required) to safely move existing in-memory state into stable storage on upgrade and restore it afterward.
- Implement real Excel template generation in the UI: select a form and download an .xlsx template whose columns come from the form fields, including an instructions sheet.
- Implement real Excel import in the UI: upload .xlsx, parse client-side, validate against selected form (required fields/types), preview valid/invalid rows with errors, and import valid rows as entity records; record import status in import history.
- Implement real Excel export in the UI: export existing records for a selected form to a downloadable .xlsx with consistent column ordering and basic metadata columns when appropriate.
- Add any necessary backend bulk import API(s) to efficiently create many entity records while keeping existing single-record APIs unchanged and enforcing authorization.
- Add an in-repo production deployment workflow documenting steps to deploy frontend/backend to IC mainnet (including environment variables like CAFFEINE_ADMIN_TOKEN) and post-deploy verification steps.

**User-visible outcome:** Data remains intact after backend upgrades, users can download Excel templates, import validated Excel data with previews and error messages, export records to Excel, and follow a documented process to deploy and verify the app on IC mainnet.
