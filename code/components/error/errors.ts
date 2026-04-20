// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

const errors = {
  "room-required-parameters": {
    description:
      "No room defined, please provide the required parameters to access a room",
    action: "BACK TO HOME",
    href: "/",
  },
  "room-failed-connection": {
    description: "A connection error has raised when connecting to the room",
    action: "BACK TO HOME",
    href: "/",
  },
  "room-connection-url": {
    description:
      "Failed to obtain the room connection endpoint, please contact the support team if the problem persists",
    action: "BACK TO HOME",
    href: "/",
  },
};

type CommonErrors = {
  [key: string]: {
    description: string;
    action: string;
    href: string;
  };
};

const COMMON_ERRORS: CommonErrors = {
  "room-required-parameters": errors["room-required-parameters"],
  "room-failed-connection": errors["room-failed-connection"],
};

export const getError = (errorCode: string) => {
  return (
    COMMON_ERRORS[errorCode] || {
      description:
        "An unknown error has occurred, please contact the support team if the problem persists",
      action: "BACK TO HOME",
      href: "/",
    }
  );
};
