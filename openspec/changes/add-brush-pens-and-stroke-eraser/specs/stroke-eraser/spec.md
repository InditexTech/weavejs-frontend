# Spec Delta

## Purpose

Lets users erase part of a stroke from the room UI, cutting it into the surviving pieces, without removing whole nodes and without touching other node types.

## ADDED Requirements

### Requirement: Stroke eraser is available only when the feature flag is on
The system SHALL register the stroke eraser tool only in builds where the pens and stroke eraser feature flag is enabled. The stroke eraser SHALL NOT have a button on the main toolbar; it SHALL be reached from the pen bar and from its keyboard shortcut.

#### Scenario: Flag off
- **WHEN** the application is built without the feature flag
- **THEN** the stroke eraser is not registered and its shortcut does nothing

#### Scenario: Flag on, main toolbar
- **WHEN** the application is built with the feature flag
- **THEN** the main toolbar is identical to the current one, with no stroke-eraser button

#### Scenario: Flag on, pen bar
- **WHEN** the application is built with the feature flag and the brush tool is active
- **THEN** the pen bar offers the stroke eraser

### Requirement: Existing eraser is unchanged
The system SHALL keep the existing "Erase" button, its `D` shortcut and `eraserTool` behaving as before, and the stroke eraser SHALL NOT reuse the name of `eraserTool` or `maskEraserTool`.

#### Scenario: Node erase still removes a whole node
- **WHEN** the user activates "Erase" and clicks a stroke
- **THEN** the whole node is removed as before

#### Scenario: Action names are unique
- **WHEN** the registered tool actions are listed
- **THEN** every action name is unique

### Requirement: Stroke eraser has its own shortcut
The system SHALL activate the stroke eraser with a keyboard shortcut that does not collide with any existing shortcut, and SHALL show it in the tooltip of the stroke eraser button in the pen bar.

#### Scenario: Pressing the shortcut
- **WHEN** the user presses the stroke-eraser shortcut with the room ready
- **THEN** the stroke eraser becomes the active tool

### Requirement: Erasing splits strokes and preserves everything else
The system SHALL, while the stroke eraser drags over a stroke, remove the touched part and leave the surviving pieces as strokes; the first piece MUST keep the original node id. Images, shapes and every other node type MUST NOT change.

#### Scenario: Erase across the middle
- **WHEN** the user drags the stroke eraser across the middle of one stroke
- **THEN** two stroke nodes remain, and the first keeps the original id

#### Scenario: Other nodes untouched
- **WHEN** the drag crosses an image, a shape and a stroke
- **THEN** only the stroke changes

#### Scenario: Locked nodes
- **WHEN** the drag crosses a locked stroke
- **THEN** that stroke is unchanged

### Requirement: Undo and redo treat one erase as one step
The system SHALL undo a whole erase gesture with one undo and redo it with one redo.

#### Scenario: Undo and redo
- **WHEN** the user erases across a stroke, then undoes, then redoes
- **THEN** the stroke is restored by the undo and cut again by the redo

### Requirement: Eraser size is in screen pixels
The system SHALL let the user set the eraser size in screen pixels from the pen bar while the stroke eraser is active, and the eraser ring MUST keep the same on-screen size at any zoom level.

#### Scenario: Setting the size
- **WHEN** the stroke eraser is active and the user sets a size in the pen bar
- **THEN** the eraser uses that diameter in screen pixels

#### Scenario: Ring at different zoom levels
- **WHEN** the stage is at 25% zoom and then at 400% zoom
- **THEN** the eraser ring has the same on-screen size in both

### Requirement: Stroke eraser is usable while zooming
The system SHALL allow the user to zoom while the stroke eraser is active, as it does for the existing eraser, and SHALL label the active tool with a display name.

#### Scenario: Zoom with the stroke eraser active
- **WHEN** the stroke eraser is active and the user zooms
- **THEN** the stage zooms and the stroke eraser stays active
