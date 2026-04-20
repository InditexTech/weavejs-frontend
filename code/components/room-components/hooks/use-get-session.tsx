// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { authClient } from "@/lib/auth.client";

export const useGetSession = () => {
  const { data: session, isPending, error } = authClient.useSession();

  return { session, isPending, error };
};
