// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Error } from "@/components/error/error";
import React from "react";

export default function ErrorPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Error />
    </React.Suspense>
  );
}
