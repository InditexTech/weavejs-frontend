# Spec Delta

## Purpose

Defines how the OneTrust cookie consent scripts are loaded in the showcase, with the correct tenant for each deployment environment.

## ADDED Requirements

### Requirement: OneTrust scripts load first in the document head
When a OneTrust tenant is configured for the current environment, the system SHALL include the OneTrust auto-block script, the OneTrust SDK stub and an `OptanonWrapper` function as the first elements of `<head>`, in that order, before any other script, meta or link element.

#### Scenario: Server-rendered page on a configured environment
- **WHEN** any route is requested directly (deep link or reload) on an environment with a configured tenant
- **THEN** the HTML response contains `OtAutoBlock.js`, then `otSDKStub.js`, then `OptanonWrapper` as the first children of `<head>`

#### Scenario: Auto-block precedes other scripts
- **WHEN** the page is parsed by the browser
- **THEN** `OtAutoBlock.js` is encountered before any other script of the application

### Requirement: Tenant is selected by environment
The system SHALL select the OneTrust domain script ID from the deployment environment (`dev` or `pro`), and SHALL use the same ID for both the auto-block script URL and the SDK stub's `data-domain-script` attribute.

#### Scenario: Dev environment
- **WHEN** the environment is `dev`
- **THEN** the domain script ID is `01a212a5-64d4-7234-8198-fe3033eae3b4` in both places

#### Scenario: Pro environment
- **WHEN** the environment is `pro`
- **THEN** the domain script ID is `01a20d38-4629-711e-afd3-95befbf4127e` in both places

### Requirement: No consent scripts without a known environment
The system SHALL NOT render any OneTrust script when the environment is unset or is not exactly `dev` or `pro`.

#### Scenario: Local development
- **WHEN** the environment is unset
- **THEN** no OneTrust script appears in the document

#### Scenario: Unknown value
- **WHEN** the environment is any value other than `dev` or `pro`
- **THEN** no OneTrust script appears in the document

### Requirement: Single initialization across client navigation
The system SHALL load the OneTrust scripts once per page load and SHALL NOT duplicate or re-initialize them during client-side navigation.

#### Scenario: Navigating between routes
- **WHEN** the user navigates between routes without a full page load
- **THEN** the document contains exactly one occurrence of each OneTrust script
