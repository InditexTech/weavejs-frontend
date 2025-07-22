// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { Avatar as AvatarUI, AvatarFallback } from "@/components/ui/avatar";
import { useCollaborationRoom } from "@/store/store";
import { EllipsisVertical } from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { getUserShort, stringToColor } from "../utils/users";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";

const SHOW_USERS_LIMIT = 4;

export const ConnectedUsers = () => {
  const connectedUsers = useWeave((state) => state.users);

  const user = useCollaborationRoom((state) => state.user);

  const [menuOpen, setMenuOpen] = React.useState(false);

  const connectedUserKey = React.useMemo(() => {
    const filterOwnUser = Object.keys(connectedUsers).filter(
      (actUser) => actUser === user?.name
    );
    return filterOwnUser?.[0];
  }, [user, connectedUsers]);

  const { showUsers, restUsers } = React.useMemo(() => {
    const filterOwnUser = Object.keys(connectedUsers).filter(
      (actUser) => actUser !== user?.name
    );
    return {
      showUsers: filterOwnUser.slice(0, SHOW_USERS_LIMIT - 1),
      restUsers: filterOwnUser.slice(SHOW_USERS_LIMIT - 1),
    };
  }, [user, connectedUsers]);

  if (Object.keys(connectedUsers).length === 0) {
    return null;
  }

  return (
    <div
      className="min-h-[40px] flex gap-1 justify-between items-center"
      style={{
        width:
          showUsers.length > 0
            ? `calc(${(showUsers.length - 1) * 16 + 32}px + ${restUsers.length > 0 ? "16px" : "0px"})`
            : "32px",
      }}
    >
      {/* <div className="flex justify-start items-center gap-1">
          <div className="w-full flex justify-start gap-2 items-center text-center font-inter font-light text-xs px-2 pl-0">
            <div>{Object.keys(connectedUsers).length}</div>
            <div className="text-left">USERS</div>
          </div>
        </div> */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div
            className="relative w-full h-[32px] flex gap-1 justify-start items-center"
            // style={{
            //   width: `calc(${connectedUserKey ? "32px" : "0px"} + ${showUsers.length > 0 ? `${(showUsers.length - 1) * 16}px` : "0px"} + ${restUsers.length > 0 ? "16px" : "0px"})`,
            // }}
            role="button"
          >
            {connectedUserKey && (
              // <Tooltip>
              //   <TooltipTrigger asChild>
              <button className="cursor-pointer rounded-none absolute top-0 left-0">
                <AvatarUI className="w-[32px] h-[32px] bg-muted font-light text-[13] leading-[18px] border-[0.5px] border-[#c9c9c9]">
                  <AvatarFallback className="bg-transparent uppercase">
                    {getUserShort(user?.name ?? "")}
                  </AvatarFallback>
                </AvatarUI>
              </button>
              //   </TooltipTrigger>
              //   <TooltipContent
              //     sideOffset={8}
              //     side="bottom"
              //     className="rounded-none flex gap-2 justify-start items-center"
              //   >
              //     <div
              //       className="w-[16px] h-[16px]"
              //       style={{ background: stringToColor(user?.name ?? "") }}
              //     ></div>
              //     <p className="font-inter text-xs">{user?.name}</p>
              //   </TooltipContent>
              // </Tooltip>
            )}
            {showUsers.map((user, index) => {
              const userInfo = connectedUsers[user];
              return (
                // <Tooltip key={user}>
                //   <TooltipTrigger asChild>
                <button
                  key={user}
                  className="cursor-pointer absolute top-0"
                  style={{ left: `${index * 16}px` }}
                >
                  <AvatarUI className="w-[32px] h-[32px] bg-muted font-light text-[13] leading-[18px] border-[0.5px] border-[#c9c9c9]">
                    <AvatarFallback className="bg-transparent uppercase">
                      {getUserShort(userInfo?.name ?? "")}
                    </AvatarFallback>
                  </AvatarUI>
                </button>
                //   </TooltipTrigger>
                //   <TooltipContent
                //     sideOffset={8}
                //     side="bottom"
                //     className="rounded-none flex gap-2 justify-start items-center"
                //   >
                //     <div
                //       className="w-[16px] h-[16px]"
                //       style={{ background: stringToColor(userInfo?.name ?? "") }}
                //     ></div>
                //     <p className="font-inter text-xs">{userInfo.name}</p>
                //   </TooltipContent>
                // </Tooltip>
              );
            })}
            {restUsers.length > 0 && (
              <button
                className="cursor-pointer absolute top-0"
                style={{ left: `${showUsers.length * 16}px` }}
              >
                <AvatarUI className="w-[32px] h-[32px] bg-muted font-light text-[13] leading-[18px] border-[0.5px] border-[#c9c9c9]">
                  <AvatarFallback className="bg-transparent uppercase">
                    <EllipsisVertical size={20} strokeWidth={1} />
                  </AvatarFallback>
                </AvatarUI>
              </button>
              // <>
              //   <Tooltip>
              //     <TooltipTrigger asChild>
              //       <DropdownMenu
              //         onOpenChange={(open: boolean) => setMenuOpen(open)}
              //       >
              //         <DropdownMenuTrigger
              //           className={cn(
              //             "rounded-full cursor-pointer p-1 !bg-muted hover:bg-accent focus:outline-none",
              //             {
              //               ["bg-accent"]: menuOpen,
              //               ["bg-white"]: !menuOpen,
              //             }
              //           )}
              //         >
              //           <ChevronDown
              //             size={24}
              //             strokeWidth={1}
              //             className="rounded-none"
              //           />
              //         </DropdownMenuTrigger>
              //         <DropdownMenuContent
              //           align="end"
              //           side="bottom"
              //           alignOffset={0}
              //           sideOffset={4}
              //           className="font-inter rounded-none"
              //         >
              //           {restUsers.map((user) => {
              //             const userInfo = connectedUsers[user];
              //             return (
              //               <DropdownMenuItem
              //                 key={user}
              //                 className="text-foreground focus:bg-white hover:rounded-none"
              //               >
              //                 <div
              //                   className="w-[16px] h-[16px]"
              //                   style={{
              //                     background: stringToColor(userInfo?.name ?? ""),
              //                   }}
              //                 ></div>
              //                 <AvatarUI className="w-[32px] h-[32px] bg-muted font-light text-[13] leading-[18px]">
              //                   <AvatarFallback className="bg-transparent uppercase">
              //                     {getUserShort(userInfo?.name ?? "")}
              //                   </AvatarFallback>
              //                 </AvatarUI>
              //                 {userInfo?.name}
              //               </DropdownMenuItem>
              //             );
              //           })}
              //         </DropdownMenuContent>
              //       </DropdownMenu>
              //     </TooltipTrigger>
              //     <TooltipContent side="bottom">
              //       <p className="font-inter text-sm">More users</p>
              //     </TooltipContent>
              //   </Tooltip>
              // </>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={12}
          className="rounded-none p-0"
        >
          <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 font-inter text-xs">
            Connected users
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {Object.keys(connectedUsers).map((userKey) => {
              const userInfo = connectedUsers[userKey];
              return (
                <React.Fragment key={userKey}>
                  <DropdownMenuItem className="text-foreground cursor-default hover:rounded-none w-full text-xs">
                    <div
                      className="w-[16px] h-[16px]"
                      style={{
                        background: stringToColor(userInfo?.id ?? ""),
                      }}
                    ></div>
                    <AvatarUI className="w-[32px] h-[32px] bg-muted font-light text-[13] leading-[18px] border-[0.5px] border-[#c9c9c9] px-3">
                      <AvatarFallback className="bg-transparent uppercase">
                        {getUserShort(userInfo?.name ?? "")}
                      </AvatarFallback>
                    </AvatarUI>
                    {userInfo?.name}
                  </DropdownMenuItem>
                </React.Fragment>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
