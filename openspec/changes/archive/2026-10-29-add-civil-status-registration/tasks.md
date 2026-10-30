# Tasks

## 1. Backend Implementation

- [x] 1.1 Create API route at `src/app/api/ambrosio/configuracoes/estadoCivil/route.ts` - verify POST endpoint returns 201 for valid requests
- [x] 1.2 Implement civil status database model - verify creation/deletion via direct API calls
- [x] 1.3 Add middleware for token authentication - verify requests without tokens get 401 responses

## 2. Frontend Implementation

- [x] 2.1 Create civil status page at `src/app/dashboard/(configuracoes)/estado-civil/page.tsx` - verify basic page renders without errors
- [x] 2.2 Build civil status data table component - verify it displays civil status values from the API
- [x] 2.3 Create civil status dialog with description field - verify form integration and validation

## 3. Menu & Integration

- [x] 3.1 Add "Estado Civil" menu item in sidebar config - verify new item appears in navigation with proper routing
- [ ] 3.2 Add civil status field to user profile workflow - verify civil status can be selected in user forms

## 4. Verification

- [ ] 4.1 Test civil status operations end-to-end - verify UI creates civil status types that appear in API responses
- [ ] 4.2 Validate error scenarios - verify empty descriptions, authorization failures, and API failures

## Workflow follow-up

- Run application locally to manually test civil status interface
- Create PR when implementation is complete