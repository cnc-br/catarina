# Proposal

## Why

Currently, carismas are displayed in a read-only list on the configuration page (`src/app/dashboard/(configuracoes)/carismas/page.tsx`). There is no way for administrators to edit a carisma's properties, such as the `casalAndaJunto` flag that controls whether a couple is automatically linked to the carisma. This change introduces an editing form (Dialog) and the corresponding update API endpoint to enable full management of carisma configurations.

## What Changes

- Add an edit form (Dialog) to the carismas configuration page that allows users to modify a carisma's details.
- Include a toggle in the form to set the `casalAndaJunto` property, using the `Carisma` interface from the `neocatecumenal` library.
- Implement an update endpoint in `src/app/api/ambrosio/configuracoes/carismas/route.ts` that accepts a carisma ID in the route path and persists the changes.
- Integrate the form with the existing carisma listing so users can open the dialog from each carisma entry.

## Capabilities

### New Capabilities

- `configuracoes/carismas`: Management of carisma configurations in the dashboard, including viewing the list and editing individual carisma records via a dialog form.

### Modified Capabilities

<!-- No existing requirements are changing; this introduces a new capability. -->

## Impact

- **UI**: `src/app/dashboard/(configuracoes)/carismas/page.tsx` and potentially `src/components/custom/dashboard/carismas/ListagemDeCarimas` to trigger the dialog.
- **API**: `src/app/api/ambrosio/configuracoes/carismas/route.ts` will be extended (or a dynamic route added) to handle update requests.
- **Data Model**: Usage of the `Carisma` interface from `neocatecumenal`, specifically the `casalAndaJunto` field.
- **Dependencies**: No new external dependencies are required.
