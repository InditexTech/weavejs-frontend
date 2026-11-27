// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import { Checkbox } from "@/components/ui/checkbox";

type LegalConsentCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function LegalConsentCheckbox({
  checked,
  onCheckedChange,
}: Readonly<LegalConsentCheckboxProps>) {
  return (
    <div className="flex items-start gap-2 max-w-[360px] text-xs leading-relaxed text-[#757575]">
      <Checkbox
        id="accept-legal-terms"
        className="mt-0.5 cursor-pointer"
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <label htmlFor="accept-legal-terms" className="cursor-pointer">
        By signing in with my social account, I accept the{" "}
        <a
          href="/legal-notice"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          Terms and Conditions
        </a>{" "}
        and the linking of my account as stated in the{" "}
        <a
          href="/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          Privacy Policy
        </a>
      </label>
    </div>
  );
}
