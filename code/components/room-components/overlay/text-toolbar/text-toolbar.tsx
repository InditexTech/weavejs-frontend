// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import {
  AlignCenter,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
  Bold,
  Check,
  ChevronDown,
  Indent,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  MoveVertical,
  Outdent,
  Plus,
  Strikethrough,
  Type,
  Underline,
} from "lucide-react";
import { useWeave } from "@inditextech/weave-react";
import { WEAVE_STORE_CONNECTION_STATUS } from "@inditextech/weave-types";
import { cn } from "@/lib/utils";
import { useCollaborationRoom } from "@/store/store";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ColorPickerInput } from "../../inputs/color-picker";
import { Toolbar } from "../../toolbar/toolbar";
import { useBreakpoint } from "../hooks/use-breakpoint";
import { useTextToolbarState } from "./use-text-toolbar-state";
import { useTextToolbarActions } from "./use-text-toolbar-actions";
import { isRichTextNode, isValidHttpUrl } from "./types";

// Marks the element as part of the text editor chrome: interacting with it
// neither blurs the editor nor ends the edit session.
const KEEP = { "data-weave-text-edit-keep": "" } as const;

// Keeps focus (and therefore the editor selection) where it is.
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

function Divider() {
  return <div className="w-px self-stretch bg-zinc-200 mx-1 my-1 shrink-0" />;
}

function IconToggle({
  icon,
  pressed,
  mixed = false,
  disabled,
  label,
  onClick,
}: Readonly<{
  icon: React.ReactNode;
  pressed: boolean;
  mixed?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      disabled={disabled}
      onMouseDown={keepFocus}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center cursor-pointer w-[32px] h-[32px] transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-black text-white": pressed,
          "bg-[#d9d9d9] text-black": !pressed && mixed,
          "bg-white text-black hover:bg-[#f0f0f0]": !pressed && !mixed,
        },
      )}
    >
      {icon}
    </button>
  );
}

const TriggerButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { label: string }
>(function TriggerButton({ children, label, className, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex items-center justify-center gap-1 cursor-pointer h-[32px] px-2 bg-white text-black hover:bg-[#f0f0f0] text-[13px] font-inter",
        className,
      )}
      {...rest}
      onMouseDown={(e) => {
        e.preventDefault();
        rest.onMouseDown?.(e);
      }}
    >
      {children}
    </button>
  );
});

function FontFamilyControl({
  value,
  mixed,
  compact,
  onChange,
}: Readonly<{
  value: string;
  mixed: boolean;
  compact: boolean;
  onChange: (v: string) => void;
}>) {
  const [open, setOpen] = React.useState(false);
  const fonts = useCollaborationRoom((state) => state.fonts.values);
  const current = fonts.find((f) => f.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <TriggerButton
          label="Font family"
          className={cn("justify-between", compact ? "w-[104px]" : "w-[140px]")}
          style={{ fontFamily: mixed ? undefined : value }}
        >
          <span className="truncate">
            {mixed ? "Mixed" : (current?.id ?? "Unknown")}
          </span>
          <ChevronDown size={14} className="shrink-0 opacity-50" />
        </TriggerButton>
      </PopoverTrigger>
      <PopoverContent
        {...KEEP}
        className="rounded-none p-0 w-[220px] border-[#c9c9c9]"
        side="bottom"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput
            className="!text-[14px] !border-b-black text-black font-normal bg-transparent shadow-none"
            placeholder="Search font..."
            onFocus={() => {
              window.weaveOnFieldFocus = true;
            }}
            onBlur={() => {
              window.weaveOnFieldFocus = false;
            }}
          />
          <CommandList>
            <CommandEmpty>
              <span className="!text-[14px] text-black">No font found.</span>
            </CommandEmpty>
            <CommandGroup>
              {fonts.map((font) => (
                <CommandItem
                  key={font.id}
                  value={font.name}
                  onSelect={() => {
                    onChange(font.name);
                    setOpen(false);
                  }}
                >
                  <span
                    className="!text-[14px] text-black"
                    style={{ fontFamily: font.name }}
                  >
                    {font.id}
                  </span>
                  {!mixed && value === font.name && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function NumberStepper({
  value,
  mixed = false,
  step,
  min,
  decimals = 0,
  label,
  icon,
  unit,
  hint,
  onChange,
}: Readonly<{
  value: number;
  mixed?: boolean;
  step: number;
  min: number;
  decimals?: number;
  label: string;
  icon?: React.ReactNode;
  unit?: string;
  hint?: string;
  onChange: (v: number) => void;
}>) {
  const [draft, setDraft] = React.useState<string>(String(value));

  React.useEffect(() => {
    setDraft(mixed ? "" : String(Number(value.toFixed(decimals))));
  }, [value, mixed, decimals]);

  const commit = (raw: number) => {
    if (Number.isNaN(raw) || raw < min) {
      setDraft(mixed ? "" : String(value));
      return;
    }
    onChange(Number(raw.toFixed(decimals)));
  };

  return (
    <div className="flex items-center" title={hint ?? label}>
      {icon && (
        <span className="w-[24px] h-[32px] flex items-center justify-center text-[#757575]">
          {icon}
        </span>
      )}
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        onMouseDown={keepFocus}
        onClick={() => commit((Number.isNaN(value) ? 0 : value) - step)}
        className="w-[24px] h-[32px] flex items-center justify-center cursor-pointer hover:bg-[#f0f0f0]"
      >
        <Minus size={14} />
      </button>
      <input
        aria-label={label}
        {...KEEP}
        className={cn(
          "h-[32px] text-center placeholder:text-black placeholder:opacity-100 text-[13px] font-inter text-black bg-transparent border-0 focus:outline-none",
          "w-[52px]",
        )}
        inputMode="decimal"
        placeholder={mixed ? "Mixed" : undefined}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => {
          window.weaveOnFieldFocus = true;
        }}
        onBlur={() => {
          window.weaveOnFieldFocus = false;
          if (draft.trim() === "") return;
          commit(parseFloat(draft));
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      {unit && !mixed && (
        <span className="text-[11px] font-inter text-[#757575] -ml-1 mr-1 select-none">
          {unit}
        </span>
      )}
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onMouseDown={keepFocus}
        onClick={() => commit((Number.isNaN(value) ? 0 : value) + step)}
        className="w-[24px] h-[32px] flex items-center justify-center cursor-pointer hover:bg-[#f0f0f0]"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function ColorControl({
  value,
  mixed,
  onChange,
}: Readonly<{ value: string; mixed: boolean; onChange: (v: string) => void }>) {
  const [open, setOpen] = React.useState(false);
  // While the picker is open the local value is the source of truth. The
  // value coming back from the node is normalized/rounded by the SDK, and
  // feeding it into the picker mid-drag makes the selection handle jump.
  const [local, setLocal] = React.useState(value);
  const pending = React.useRef<string | null>(null);
  const frame = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!open) setLocal(value);
  }, [value, open]);

  const flush = React.useCallback(() => {
    frame.current = null;
    if (pending.current !== null) {
      onChange(pending.current);
      pending.current = null;
    }
  }, [onChange]);

  const handleChange = React.useCallback(
    (color: string) => {
      setLocal(color);
      pending.current = color;
      frame.current ??= requestAnimationFrame(flush);
    },
    [flush],
  );

  React.useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          if (frame.current !== null) cancelAnimationFrame(frame.current);
          flush();
        }
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <TriggerButton label="Font color" className="w-[40px]">
          <span
            className="w-[18px] h-[18px] border border-[#c9c9c9]"
            style={{
              background: mixed
                ? "linear-gradient(135deg,#fff 45%,#999 50%,#fff 55%)"
                : local,
            }}
          />
        </TriggerButton>
      </PopoverTrigger>
      <PopoverContent
        {...KEEP}
        side="bottom"
        align="start"
        sideOffset={8}
        className="rounded-none border-[#c9c9c9] w-[300px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ColorPickerInput value={local} onChange={handleChange} />
      </PopoverContent>
    </Popover>
  );
}

function LinkControl({
  current,
  mixed,
  onApply,
}: Readonly<{
  current: string;
  mixed: boolean;
  onApply: (url: string | undefined) => string | null;
}>) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(current);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setDraft(current);
      setError(null);
    }
  }, [open, current]);

  const submit = () => {
    const url = draft.trim();
    if (url === "") {
      setError(onApply(undefined));
      if (!error) setOpen(false);
      return;
    }
    if (!isValidHttpUrl(url)) {
      setError("Enter a valid http(s) URL");
      return;
    }
    const result = onApply(url);
    setError(result);
    if (!result) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <TriggerButton
          label="Hyperlink"
          className={cn("w-[32px] !px-0", {
            "bg-black text-white hover:bg-black": current !== "" && !mixed,
          })}
        >
          <Link2 size={16} strokeWidth={1.5} />
        </TriggerButton>
      </PopoverTrigger>
      <PopoverContent
        {...KEEP}
        side="bottom"
        align="end"
        sideOffset={8}
        className="rounded-none border-[#c9c9c9] w-[320px] p-2 flex flex-col gap-2"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Input
          type="text"
          autoFocus
          placeholder="https://example.com"
          className="w-full h-[32px] rounded-none !text-[13px] !border-[#c9c9c9] font-normal text-black focus:outline-none bg-transparent shadow-none"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onFocus={() => {
            window.weaveOnFieldFocus = true;
          }}
          onBlur={() => {
            window.weaveOnFieldFocus = false;
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        {error && (
          <div className="text-[11px] text-red-600 font-inter font-light">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="h-[32px] px-4 text-[13px] font-inter bg-white text-black border border-[#c9c9c9] cursor-pointer transition-colors hover:bg-[#f0f0f0] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            disabled={current === ""}
            onMouseDown={keepFocus}
            onClick={() => {
              setDraft("");
              const result = onApply(undefined);
              setError(result);
              if (!result) setOpen(false);
            }}
          >
            Remove
          </button>
          <button
            type="button"
            className="h-[32px] px-4 text-[13px] font-inter bg-black text-white border border-black cursor-pointer transition-colors hover:bg-[#333]"
            onMouseDown={keepFocus}
            onClick={submit}
          >
            Apply
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const TextToolbar = () => {
  const state = useTextToolbarState();
  const actions = useTextToolbarActions(state);
  const viewType = useCollaborationRoom((s) => s.viewType);
  const readOnly =
    useWeave((s) => s.connection.status) !==
    WEAVE_STORE_CONNECTION_STATUS.CONNECTED;

  const breakpoint = useBreakpoint();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [top, setTop] = React.useState<number>(72);
  const visible = !!state;

  // Always sit 8px below whatever the top bars occupy. NodeToolbar renders
  // its bar at a different offset per breakpoint, so measure it instead of
  // hardcoding offsets.
  React.useLayoutEffect(() => {
    if (!visible) return;
    const GAP = 8;
    // Floating view: the room header sits above (48px tall below 2xl, 72px at
    // 2xl, starting at 16px).
    const headerBottom =
      viewType === "floating" ? (breakpoint === "2xl" ? 88 : 64) : 0;

    const measure = () => {
      const parent = rootRef.current?.offsetParent as HTMLElement | null;
      const parentTop = parent?.getBoundingClientRect().top ?? 0;
      let bottom = headerBottom;
      const root = document.querySelector("[data-node-toolbar]");
      root?.querySelectorAll<HTMLElement>(".bg-white").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        bottom = Math.max(bottom, r.bottom - parentTop);
      });
      const next = Math.round(bottom + GAP);
      setTop((prev) => (prev === next ? prev : next));
    };

    measure();
    const parent = rootRef.current?.offsetParent as HTMLElement | null;
    const ro = new ResizeObserver(measure);
    const mo = new MutationObserver(measure);
    document
      .querySelectorAll("[data-node-toolbar]")
      .forEach((el) => ro.observe(el));
    if (parent) {
      mo.observe(parent, { childList: true, subtree: true });
    }
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [visible, viewType, breakpoint]);

  if (!state) return null;

  // The controls are always split in two rows. Below xl the steppers also
  // drop their icons and the font field narrows.
  const compact = breakpoint !== "xl" && breakpoint !== "2xl";

  const { props, format, rich, mode } = state;
  const q = (key: "bold" | "italic" | "underline" | "strike") => {
    if (rich && format) {
      return {
        on: format[key].state === "all",
        mixed: format[key].state === "some",
      };
    }
    const fontStyle = props.fontStyle ?? "normal";
    const deco = props.textDecoration ?? "";
    const on =
      key === "bold"
        ? fontStyle.includes("bold")
        : key === "italic"
          ? fontStyle.includes("italic")
          : key === "underline"
            ? deco === "underline"
            : deco === "line-through";
    return { on, mixed: false };
  };

  const baseFamily = props.fontFamily ?? "";
  const familyMixed = rich && format?.family.state === "some";
  const familyValue =
    rich && typeof format?.family.value === "string"
      ? format.family.value
      : baseFamily;

  const colorMixed = rich && format?.color.state === "some";
  const colorValue =
    rich && typeof format?.color.value === "string"
      ? format.color.value
      : (props.fill ?? "#000000");

  const sizeMixed = rich && format?.size.state === "some";
  const sizeValue =
    rich && typeof format?.size.value === "number"
      ? format.size.value
      : (props.fontSize ?? 16);

  const linkMixed = rich && format?.link.state === "some";
  const linkValue =
    rich && typeof format?.link.value === "string" ? format.link.value : "";

  const lineHeightMixed = rich && format?.lineHeight.state === "some";
  const lineHeightValue =
    rich && typeof format?.lineHeight.value === "number"
      ? format.lineHeight.value
      : (props.lineHeight ?? 1);

  const alignMixed = rich && format?.align.state === "some";
  const align =
    rich && format?.align.state === "all" && format.align.value
      ? format.align.value
      : (props.align ?? "left");
  const vAlign = props.verticalAlign ?? "top";

  return (
    <div
      {...KEEP}
      ref={rootRef}
      style={{ top }}
      className="pointer-events-none absolute left-[8px] right-[8px] flex justify-center"
    >
      <Toolbar
        orientation="horizontal"
        className={cn(
          compact ? "w-[660px]" : "w-[740px]",
          "pointer-events-auto max-w-full overflow-x-auto border-[0.5px] !border-[#c9c9c9] shadow-sm",
          "!flex-col items-stretch gap-0",
          { "opacity-50 !pointer-events-none": readOnly },
        )}
      >
        <div className="flex items-center shrink-0">
          {mode === "update" && (
            <>
              <span className="mx-1 inline-flex items-center justify-center w-[72px] h-[20px] px-0 text-[11px] font-inter font-medium uppercase tracking-wide whitespace-nowrap select-none border bg-black text-white border-black">
                {isRichTextNode(props) ? "Rich text" : "Text"}
              </span>
              <Divider />
            </>
          )}
          <FontFamilyControl
            compact={compact}
            value={familyValue}
            mixed={familyMixed}
            onChange={actions.setFamily}
          />
          <NumberStepper
            label="Font size"
            unit="px"
            hint="Font size (px)"
            icon={compact ? undefined : <Type size={16} strokeWidth={1.5} />}
            value={sizeValue}
            mixed={sizeMixed}
            step={1}
            min={1}
            decimals={0}
            onChange={actions.setSize}
          />
          <ColorControl
            value={colorValue}
            mixed={colorMixed}
            onChange={actions.setColor}
          />
          <Divider />
          <IconToggle
            label="Bold"
            icon={<Bold size={16} strokeWidth={1.5} />}
            pressed={q("bold").on}
            mixed={q("bold").mixed}
            onClick={() => actions.toggleFontStyle("bold")}
          />
          <IconToggle
            label="Italic"
            icon={<Italic size={16} strokeWidth={1.5} />}
            pressed={q("italic").on}
            mixed={q("italic").mixed}
            onClick={() => actions.toggleFontStyle("italic")}
          />
          <IconToggle
            label="Underline"
            icon={<Underline size={16} strokeWidth={1.5} />}
            pressed={q("underline").on}
            mixed={q("underline").mixed}
            onClick={() => actions.toggleDecoration("underline")}
          />
          <IconToggle
            label="Strikethrough"
            icon={<Strikethrough size={16} strokeWidth={1.5} />}
            pressed={q("strike").on}
            mixed={q("strike").mixed}
            onClick={() => actions.toggleDecoration("strike")}
          />
          <Divider />
          <NumberStepper
            label="Line height"
            unit="%"
            hint="Line height (percentage of font size)"
            icon={
              compact ? undefined : <MoveVertical size={16} strokeWidth={1.5} />
            }
            value={Math.round(lineHeightValue * 100)}
            mixed={lineHeightMixed}
            step={5}
            min={10}
            decimals={0}
            onChange={(v) => actions.setLineHeight(v / 100)}
          />
        </div>
        <div className="h-px w-full bg-zinc-200 my-[3px]" />
        <div className="flex items-center shrink-0">
          {rich &&
            isRichTextNode(props) &&
            format &&
            state.nodeInstance &&
            actions.handler && (
              <>
                <IconToggle
                  label="Bulleted list"
                  icon={<List size={16} strokeWidth={1.5} />}
                  pressed={format.list.kind === "ul"}
                  onClick={() =>
                    actions.handler?.toggleList(state.nodeInstance!, "ul")
                  }
                />
                <IconToggle
                  label="Numbered list"
                  icon={<ListOrdered size={16} strokeWidth={1.5} />}
                  pressed={format.list.kind === "ol"}
                  onClick={() =>
                    actions.handler?.toggleList(state.nodeInstance!, "ol")
                  }
                />
                <IconToggle
                  label="Outdent"
                  icon={<Outdent size={16} strokeWidth={1.5} />}
                  pressed={false}
                  disabled={format.list.kind === "none"}
                  onClick={() => actions.handler?.outdent(state.nodeInstance!)}
                />
                <IconToggle
                  label="Indent"
                  icon={<Indent size={16} strokeWidth={1.5} />}
                  pressed={false}
                  disabled={format.list.kind === "none"}
                  onClick={() => actions.handler?.indent(state.nodeInstance!)}
                />
                <Divider />
              </>
            )}
          {(
            [
              ["left", AlignLeft, "Align left"],
              ["center", AlignCenter, "Align center"],
              ["right", AlignRight, "Align right"],
            ] as const
          ).map(([value, Icon, label]) => (
            <IconToggle
              key={value}
              label={label}
              icon={<Icon size={16} strokeWidth={1.5} />}
              pressed={!alignMixed && align === value}
              mixed={alignMixed}
              onClick={() => actions.setAlign(value)}
            />
          ))}
          <Divider />
          {(
            [
              ["top", AlignStartHorizontal, "Align top"],
              ["middle", AlignCenterHorizontal, "Align middle"],
              ["bottom", AlignEndHorizontal, "Align bottom"],
            ] as const
          ).map(([value, Icon, label]) => (
            <IconToggle
              key={value}
              label={label}
              icon={<Icon size={16} strokeWidth={1.5} />}
              pressed={vAlign === value}
              onClick={() => actions.patchProps({ verticalAlign: value })}
            />
          ))}
          {mode === "update" && (
            <>
              <Divider />
              <LinkControl
                current={linkValue}
                mixed={linkMixed}
                onApply={actions.applyLink}
              />
            </>
          )}
        </div>
      </Toolbar>
    </div>
  );
};
