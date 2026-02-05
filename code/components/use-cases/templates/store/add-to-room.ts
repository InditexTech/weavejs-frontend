// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { TemplateEntity } from "../components/templates/types";

type Step = "select-room" | "select-template" | "confirm";

type Room = {
  id: string;
  create: boolean;
};

interface AddToRoomState {
  step: Step;
  room: Room | undefined;
  template: TemplateEntity | undefined;
  frameName: string;
  setStep: (step: Step) => void;
  setRoom: (room: Room | undefined) => void;
  setTemplate: (template: TemplateEntity | undefined) => void;
  setFrameName: (frameName: string) => void;
}

export const useAddToRoom = create<AddToRoomState>()((set) => ({
  step: "select-room",
  room: undefined,
  template: undefined,
  frameName: "",
  setStep: (step) => set((state) => ({ ...state, step })),
  setRoom: (room) => set((state) => ({ ...state, room })),
  setTemplate: (template) => set((state) => ({ ...state, template })),
  setFrameName: (frameName) => set((state) => ({ ...state, frameName })),
}));
