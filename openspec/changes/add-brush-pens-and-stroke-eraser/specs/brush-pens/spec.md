# Spec Delta

## Purpose

Lets users choose a drawing pen, size, opacity and colour for the brush tool, minimise the controls, and switch to the stroke eraser, from one pen bar (and the same controls in the brush sidebar), so strokes can be drawn with different looks (pencil, pen, fineliner, marker, highlighter, brush, fountain pen).

## ADDED Requirements

### Requirement: Pen bar is available only when the feature flag is on
The system SHALL show the pen bar only in builds where the pens and stroke eraser feature flag is enabled, and only while the brush tool or the stroke eraser is the active tool, as a bar centred at the bottom of the canvas with an 8px gap above the footer. Without the flag, no pen bar SHALL appear and the brush properties panel SHALL be identical to the current one.

#### Scenario: Flag off
- **WHEN** the application is built without the feature flag and the brush tool is active
- **THEN** no pen bar appears

#### Scenario: Flag on, brush active
- **WHEN** the application is built with the feature flag and the brush tool is active
- **THEN** the pen bar shows pencil, pen, fineliner, marker, highlighter, brush and fountain pen in that order, the stroke eraser, a size button and a colour button

#### Scenario: Other tools
- **WHEN** the application is built with the feature flag and a tool other than the brush or the stroke eraser is active
- **THEN** no pen bar appears

### Requirement: Selected pen applies to new strokes
The system SHALL apply the pen chosen in the picker to strokes drawn afterwards with the brush tool, in the room and in the standalone use case.

#### Scenario: Drawing with a chosen pen
- **WHEN** the user selects a pen and draws a stroke
- **THEN** the stroke is drawn with that pen's look

#### Scenario: Changing pen between strokes
- **WHEN** the user draws a stroke, selects another pen and draws a second stroke
- **THEN** the first stroke keeps its look and the second uses the new pen

#### Scenario: Default behaviour without choosing a pen
- **WHEN** the user draws with the brush tool and has never chosen a pen
- **THEN** the stroke looks exactly as it does today

### Requirement: The pen bar opens on the pens
The system SHALL show the tools panel with the pens whenever the pen bar opens, whatever panel was shown when it was last used.

#### Scenario: Brush chosen again
- **WHEN** the user opens the colour panel, chooses another tool and then the brush tool
- **THEN** the pen bar shows the pens

### Requirement: Pen bar keeps an 8px gap above the footer
The system SHALL place the pen bar 8px above the top edge of the footer, in the room and in the standalone use case, and SHALL keep it centred in the canvas area that is not covered by an open sidebar.

#### Scenario: Room
- **WHEN** the pen bar is shown in the room
- **THEN** its bottom edge is 8px above the top edge of the room footer

#### Scenario: Standalone
- **WHEN** the pen bar is shown in the standalone use case
- **THEN** its bottom edge is 8px above the top edge of the footer

### Requirement: Pen tips show the ink colour
The system SHALL draw each pen in the tray upright, with a neutral barrel and its tip and a band in the colour that pen will draw with. The highlighter SHALL keep its own colour, yellow by default, and every other pen SHALL share one colour.

#### Scenario: Choosing a colour
- **WHEN** the user picks a colour while a pen other than the highlighter is selected
- **THEN** the tips and bands of all pens except the highlighter show that colour

#### Scenario: Highlighter colour
- **WHEN** the user picks a colour while the highlighter is selected
- **THEN** only the highlighter's tip and band change colour

### Requirement: The chosen pen is easy to see
The system SHALL show which pen, or the stroke eraser, is chosen, with more than the pen's drawing: the chosen one SHALL be lifted above the others, have a highlighted slot and an underline, and the others SHALL be shown slightly dimmed once one has been chosen.

#### Scenario: A pen is chosen
- **WHEN** the user chooses the marker
- **THEN** the marker is lifted, has a slot and an underline, and the other pens and the eraser are slightly dimmed

#### Scenario: Nothing chosen yet
- **WHEN** the brush tool is active and no pen has been chosen
- **THEN** no pen has a slot or an underline, and no pen is dimmed

### Requirement: Colour panel
The system SHALL open a colour panel in place of the tools when the user presses the colour button, with a row of colour chips marking the current colour and a control for any other colour, and SHALL return to the tools with a back button. Choosing a colour SHALL apply it to new strokes.

#### Scenario: Picking a chip
- **WHEN** the user opens the colour panel and presses a chip
- **THEN** that colour is applied to new strokes and the chip is marked as current

#### Scenario: Any colour
- **WHEN** the user presses the custom colour chip
- **THEN** a colour picker opens and the colour it gives is applied to new strokes

### Requirement: Size and opacity panel
The system SHALL open a size and opacity panel in place of the tools when the user presses the size button, with a size slider and, for pens, an opacity slider, each showing its value, and SHALL return to the tools with a back button. Changing the size SHALL keep the chosen pen's look proportional to the size, and changing the opacity SHALL apply it to new strokes. While the stroke eraser is active the panel SHALL show only the eraser size, in screen pixels.

#### Scenario: Changing size
- **WHEN** the user sets a size and draws a stroke
- **THEN** the stroke is drawn with that width and the pen remains selected

#### Scenario: Changing opacity
- **WHEN** the user sets an opacity and draws a stroke
- **THEN** the stroke is drawn with that opacity, also after the pen's look was rescaled by a size change

#### Scenario: Eraser
- **WHEN** the stroke eraser is active and the user opens the panel
- **THEN** only a size slider is shown

### Requirement: Each pen has its own size and opacity
The system SHALL give each pen a default size and opacity when it is first chosen and SHALL remember the size and opacity the user sets for it, restoring them whenever that pen is chosen again or the brush tool is activated again.

#### Scenario: Defaults
- **WHEN** the user chooses the marker for the first time
- **THEN** its size is larger than the pencil's default size

#### Scenario: Memory
- **WHEN** the user sets a size for the pencil, chooses the marker and then the pencil again
- **THEN** the pencil has the size the user set

#### Scenario: Back to the brush
- **WHEN** the user presses the eraser and then the brush tool in the main toolbar
- **THEN** the brush has the last chosen pen with its size, opacity and colour

### Requirement: The pen bar can be minimised
The system SHALL let the user minimise the pen bar into a small square tile that shows the pen in hand and restores the bar when pressed, and SHALL keep the choice while the page stays open.

#### Scenario: Minimise
- **WHEN** the user presses the minimise button
- **THEN** the bar becomes a small square tile showing the active pen

#### Scenario: Restore
- **WHEN** the user presses the tile
- **THEN** the full bar is shown again

### Requirement: The brush sidebar offers the same controls
The system SHALL show the same pen tray, colour chips and size and opacity sliders in the brush tool's properties panel when the feature flag is on, in place of the separate brush size, stroke colour and opacity fields, and the bar and the panel SHALL always show the same values.

#### Scenario: Change in the sidebar
- **WHEN** the user picks a pen in the sidebar
- **THEN** the pen bar shows the same pen

### Requirement: Pen bar switches between pens and the stroke eraser
The system SHALL let the user switch from a pen to the stroke eraser and back from the pen bar, and the bar SHALL remember the last pen.

#### Scenario: Pen to eraser
- **WHEN** the brush tool is active and the user presses the eraser in the pen bar
- **THEN** the stroke eraser becomes the active tool and the pen bar stays visible

#### Scenario: Eraser to pen
- **WHEN** the stroke eraser is active and the user presses a pen in the pen bar
- **THEN** the brush tool becomes active with that pen

### Requirement: Strokes remain readable by clients without pen support
The system SHALL NOT make strokes unreadable for clients running an SDK without pen support; such clients MUST still render them, as plain round strokes.

#### Scenario: Older viewer
- **WHEN** a stroke drawn with a pen is loaded by a client without pen support
- **THEN** the client renders the stroke as a round stroke and does not fail
