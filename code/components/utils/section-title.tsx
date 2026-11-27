// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

type SectionTitleProps = {
  children: React.ReactNode;
};

export function SectionTitle({ children }: Readonly<SectionTitleProps>) {
  return (
    <h2 className="font-inter font-semibold text-xs uppercase tracking-widest text-neutral-600">
      {children}
    </h2>
  );
}
