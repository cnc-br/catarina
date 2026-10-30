# Proposal

## Why

Currently, the system lacks civil status (estado civil) management capabilities. This omission prevents capturing important user profile information which is essential for complete demographic data management. The change adds this critical feature to allow administrators to configure available civil status options.

## What Changes

- **NEW**: Add civil status management menu under "Configurações"
- **NEW**: Create civil status API endpoint (`POST /api/ambrosio/configuracoes/estadoCivil`)
- **NEW**: Build civil status management UI similar to the existing 'etapas' interface

## Capabilities

### New Capabilities
- `identity/civil-status-management`: Administrative interface for defining civil status options 

### Modified Capabilities
(None - all functionality is new)

## Impact

- **Frontend**: New page (`/dashboard/(configuracoes)/estado-civil`) with table and creation dialog
- **Backend**: New API route (`/api/ambrosio/configuracoes/estadoCivil`)
- **Database**: New civil status table/collection to store values
- **Navigation**: Update sidebar menu structure