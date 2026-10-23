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

[Unreleased]: https://github.com/InditexTech/weavejs/compare/HEAD
