// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from "@tanstack/react-router";
import { Logo } from "../utils/logo";
import { Divider } from "../room-components/overlay/divider";
import { Button } from "../ui/button";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex flex-col max-w-[400px] gap-8">
        <div className="flex flex-col">
          <div className="w-full flex flex-col gap-2 justify-center items-center">
            <Logo kind="landscape" variant="no-text" />
          </div>
        </div>
        <h1 className="font-light text-xl2">Oops we couldn't find this page</h1>
        <Divider className="h-[1px] w-full" />
        <div className="flex justify-center items-center">
          <Button
            className="cursor-pointer font-inter font-light rounded-none"
            onClick={async () => {
              navigate({ to: "/" });
            }}
          >
            BACK TO HOME
          </Button>
        </div>
      </div>
    </div>
  );
};
