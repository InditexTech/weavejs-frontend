// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

const topElementVariants = {
  hidden: {
    transform: "translateY(-20%)",
    opacity: 0,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
  visible: {
    transform: "translateY(0)",
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0 },
  },
};

const bottomElementVariants = {
  hidden: {
    transform: "translateY(20%)",
    opacity: 0,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
  visible: {
    transform: "translateY(0)",
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0 },
  },
};

const leftElementVariants = {
  hidden: {
    transform: "translateX(-20%)",
    opacity: 0,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1], delay: 0 },
  },
  visible: {
    transform: "translateX(0)",
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0 },
  },
};

const rightElementVariants = {
  hidden: {
    transform: "translateX(10%)",
    opacity: 0,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1], delay: 0 },
  },
  visible: {
    transform: "translateX(0)",
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0 },
  },
};

export {
  topElementVariants,
  bottomElementVariants,
  leftElementVariants,
  rightElementVariants,
};
