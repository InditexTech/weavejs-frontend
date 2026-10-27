<!--
SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)

SPDX-License-Identifier: Apache-2.0
-->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Use `WeaveTextV2Node` (native on-canvas text editing) in place of `WeaveTextNode` and warn on large text nodes (`onTextSizeWarning`).
- Add a Rich text tool (`richTextTool`, `Shift+T`) and a rich text sidebar section (marks, color, size, lists) using the per-node `richText` attribute.
- Rich text sidebar also sets font family and per-selection hyperlinks; node-level color, style, decoration, font family and hyperlink controls are hidden for rich text nodes. The sidebar keeps the editor open via `data-weave-text-edit-keep`.
- Configure `edition.followPadding` so the canvas follows the caret clear of the app UI.

[Unreleased]: https://github.com/InditexTech/weavejs/compare/HEAD
