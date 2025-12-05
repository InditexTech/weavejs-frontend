// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

"use client";

import React from "react";
import { MessagesSquareIcon } from "lucide-react";
import { useStandaloneUseCase } from "../../store/store";

export function Comments() {
  const commentsShow = useStandaloneUseCase((state) => state.comments.show);
  const setCommentsShow = useStandaloneUseCase(
    (state) => state.setCommentsShow
  );

  return (
    <>
      <button
        className="group cursor-pointer bg-white disabled:cursor-default hover:disabled:bg-transparent px-3 h-[40px] hover:text-[#c9c9c9] flex gap-3 justify-center items-center"
        onClick={() => {
          setCommentsShow(!commentsShow);
        }}
      >
        <MessagesSquareIcon strokeWidth={1} size={16} /> COMMENTS
      </button>
      <Comments />
    </>
  );
}
