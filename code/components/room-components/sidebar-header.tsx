// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";

type SidebarHeaderProps = {
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export const SidebarHeader = ({
  children,
  actions,
}: Readonly<SidebarHeaderProps>) => {
  return (
    <div className="w-full px-[24px] py-[20px] bg-white flex justify-between items-center border-b-[0.5px] border-[#c9c9c9]">
      <div className="flex justify-between font-inter font-light items-center text-[24px] uppercase">
        {children}
      </div>
      {actions && (
        <div className="flex justify-end items-center gap-4">{actions}</div>
      )}
    </div>
  );
};
