# Design

## Context
The system already has a similar configuration management interface for "etapas" that provides a pattern for creating new administrative views. The existing AuthGuard middleware handles API authentication. This implementation will follow established patterns while creating new civil status management functionality.

## Goals / Non-Goals

**Goals:**
1. Create civil status management interface with CRUD operations
2. Implement API endpoint with token-based authentication
3. Reuse existing UI patterns for consistency
4. Integrate civil status data into user profile workflows

**Non-Goals:**
1. Migrate existing user data to civil status categories
2. Implement multiple language support
3. Create advanced filtering or search capabilities

## Decisions

1. **Frontend Architecture**
   - Reuse components from stages management (`etapas`) to maintain UI consistency
   - Why: Reduces development effort and ensures consistent admin experience
   - Alternative considered: Building from scratch would take longer and create visual inconsistencies

2. **API Design**
   - Place endpoint at `/api/ambrosio/configuracoes/estadoCivil` to match existing patterns
   - Why: Consistent with `/api/ambrosio/configuracoes/etapas` conventions
   - Alternative: Creating a generic CRUD endpoint would reduce flexibility

3. **Data Model**
   - Store civil status options as separate documents/rows with description
   - Why: Simplicity matches current implementation patterns
   - Alternative: Fixed enum would reduce flexibility

4. **Authentication**
   - Reuse existing middleware (AuthGuard) for API protection
   - Why: Leverages tested security implementation
   - Alternative: Creating custom auth would increase complexity and security risks