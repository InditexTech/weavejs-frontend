## ADDED Requirements

### Requirement: Sidebar and canvas sizing from shared tokens
The room editor's left sidebar, right sidebar and canvas SHALL derive their widths and vertical offsets from shared layout tokens, so that changing a token resizes all three consistently and the canvas never overlaps a fixed sidebar.

#### Scenario: Fixed mode reserves space
- **WHEN** the room is in fixed view
- **THEN** the canvas occupies exactly the width between the left and right sidebars and above the footer

#### Scenario: Floating mode
- **WHEN** the room is in floating view and a sidebar is shown
- **THEN** it is inset from the top and bottom by the tokenised offsets and overlays the full-width canvas

### Requirement: Right sidebar header and content split
In fixed view the right sidebar SHALL lay out its header and its content so that the content fills the remaining height regardless of the header's height.

#### Scenario: Taller header
- **WHEN** the header grows taller than its default height
- **THEN** the content shrinks to fit without overflowing the sidebar

### Requirement: Hidden sidebars keep state
Hiding a sidebar in floating view SHALL NOT discard its state (for example the element tree's expansion and scroll position), and a hidden sidebar SHALL NOT be reachable by keyboard or pointer.

#### Scenario: Toggle left sidebar
- **WHEN** the floating left sidebar is hidden and shown again
- **THEN** the element tree appears in the same expanded state
