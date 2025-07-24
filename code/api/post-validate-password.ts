// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

export const postValidatePassword = async (password: string) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/ai/password/validate?password=${password}`;
  const response = await fetch(endpoint, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to validate password");
  }

  const data = await response.json();
  return data;
};
