// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client"

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

type AppProvidersProps = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

export function AppProviders({ children }: Readonly<AppProvidersProps>) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}