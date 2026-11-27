# legal-pages Specification

## Purpose

Public, Markdown-driven legal pages (cookies policy, legal notice, privacy policy), their routes, layout, sidebar links, coming-soon reachability, and the legal terms acceptance required before social login.

## Requirements
### Requirement: Public legal page routes
The showcase SHALL serve three public pages at `/cookies-policy`, `/legal-notice` and `/privacy-policy`, in English, without a language segment in the path. Each page SHALL be served at its own URL without redirects and SHALL set its own document title. The pages SHALL NOT require a user session or backend call.

#### Scenario: Page is reachable
- **WHEN** a visitor requests `/cookies-policy`, `/legal-notice` or `/privacy-policy`
- **THEN** the response status is 200, the URL is unchanged, and the document title identifies that page

#### Scenario: No session
- **WHEN** an unauthenticated visitor opens a legal page
- **THEN** the page renders its content; the sidebar's optional session lookup does not block it

### Requirement: Markdown-driven content
Each legal page SHALL render the Markdown file of the same name in `code/content/legal/` (`cookies-policy.md`, `legal-notice.md`, `privacy-policy.md`). Replacing those files SHALL be sufficient to change the published text. Until final texts are provided, the files SHALL contain placeholder content exercising headings, paragraphs, lists, a table and a link.

#### Scenario: Content from file
- **WHEN** `privacy-policy.md` is edited and the app is rebuilt
- **THEN** `/privacy-policy` shows the new text with no code change

### Requirement: Safe Markdown rendering
The renderer SHALL support GitHub-flavoured Markdown (headings, lists, tables, links) styled as a readable document, and SHALL NOT render raw HTML embedded in the Markdown.

#### Scenario: Raw HTML ignored
- **WHEN** the Markdown contains `<script>` or other raw HTML
- **THEN** it is not rendered as HTML elements

#### Scenario: Table and links
- **WHEN** the Markdown contains a table and a link
- **THEN** they render as a table and an anchor

### Requirement: Legal page layout
Each legal page SHALL use the same two-area layout as the home pages: the showcase left sidebar on the left (at desktop widths) and, in the free area, the page title followed by the rendered Markdown, left-aligned and constrained to a readable width.

#### Scenario: Content area
- **WHEN** a legal page is shown at a desktop width
- **THEN** the sidebar is on the left and the title and Markdown start at the left of the remaining area

### Requirement: Sidebar links
The left sidebar SHALL show `COOKIES POLICY`, `LEGAL NOTICE` and `PRIVACY POLICY` links below DEPENDENCIES, pointing to the three routes and opening in the same tab. They SHALL appear on the home, standalone home and room access pages.

#### Scenario: Sidebar navigation
- **WHEN** the visitor clicks `LEGAL NOTICE` in the sidebar
- **THEN** the browser navigates to `/legal-notice` in the same tab

### Requirement: Reachable in coming-soon mode
When coming-soon mode is enabled, the three legal paths SHALL remain reachable and SHALL NOT be replaced by the coming-soon page.

#### Scenario: Allow-listed
- **WHEN** coming-soon mode is on and `isAllowedPath` is evaluated for each legal path (with or without a trailing slash)
- **THEN** it returns true

### Requirement: Legal terms acceptance before login
Every screen offering social login buttons (session login and room access link) SHALL show a checkbox, before the buttons, to accept the legal terms. Its label SHALL read "By signing in with my social account, I accept the Terms and Conditions and the linking of my account as stated in the Privacy Policy", where "Terms and Conditions" links to the Legal Notice page and "Privacy Policy" links to the Privacy Policy page, both opening in a new tab. The checkbox SHALL be unchecked by default, and the login buttons SHALL be disabled until it is checked. Acceptance is client-side only and is not persisted.

#### Scenario: Unchecked blocks login
- **WHEN** the login buttons are shown and the checkbox is unchecked
- **THEN** the Google and GitHub buttons are disabled and no sign-in is started

#### Scenario: Checked enables login
- **WHEN** the visitor checks the checkbox
- **THEN** the Google and GitHub buttons become enabled

#### Scenario: Policies readable without losing state
- **WHEN** the visitor opens a policy link from the label
- **THEN** it opens in a new tab and the login screen is unchanged

### Requirement: Home sidebar groups
The home sidebar SHALL group its policy links under a LEGAL title and GITHUB, DOCUMENTATION and DEPENDENCIES under a RESOURCES title, and SHALL show the user menu last.

#### Scenario: User menu
- **WHEN** a logged-in user opens the user menu
- **THEN** it offers COPY USER ID and SIGN OUT
