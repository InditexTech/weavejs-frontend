// SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)
//
// SPDX-License-Identifier: Apache-2.0

import type { CSSProperties } from "react";
import { Image as ImageIcon, MousePointer2, Square, Type } from "lucide-react";
import type { Act } from "../stageshow/act";
import type { Rect } from "../stageshow/measure";
import { Facepile } from "../stageshow/parts/Facepile";
import { Stage } from "../stageshow/stage";
import { Bar, Window } from "../stageshow/window";
import "./session.hero-demo.css";

// Weave.js showcase: two people in one room, a 16:9 shot that is the window
// alone, filling the stage and cut at the bottom. The line, plane and shadow
// that give it depth are the host page's (session.hero-frame), not the shot's. Alex picks the rectangle tool
// and draws a card on the canvas; Sam clicks into it and types two words.
// Both rest with their marks on screen; the exit takes back what they added
// in one reverse stagger while the cursors drift to their resting corners.
//
// Each person is one color everywhere: their face in the pile, their cursor,
// their name flag, their selection handles or text ring and their caret.
// Neither is the product's own (black) accent. Their work is shown in the
// canvas's own marks (a selection with handles, a text node being edited),
// never in a bubble or a badge. There is no own-cursor: we watch the others.
//
// Real strings: the room, the board title, the typed words, the two names.
// (Five strings; everything else is a placeholder bar or a plain shape.)

type AlexAt = "rest" | "tool" | "draw0" | "draw1";
type SamAt = "rest" | "in";
type S = {
  /** Cursors take their resting spots silently, then ease once the story starts */
  live: boolean;
  alex: AlexAt;
  sam: SamAt;
  tool: "select" | "rect";
  press: boolean;
  rectOn: boolean;
  alexSel: boolean;
  samEdit: boolean;
  samShow: boolean;
  samText: string;
};

const initial: S = {
  live: false,
  alex: "rest",
  sam: "rest",
  tool: "select",
  press: false,
  rectOn: false,
  alexSel: false,
  samEdit: false,
  samShow: true,
  samText: "",
};
const PEOPLE = { alex: "#2f6fed", sam: "#d9480f" };

async function script(a: Act<S>) {
  await a.wait(300);
  a.put({ live: true });
  await a.wait(150);

  // 1. Alex picks the rectangle tool
  a.mark("tool");
  a.put({ alex: "tool" });
  await a.wait(1100);
  a.put({ press: true });
  await a.wait(170);
  a.put({ press: false, tool: "rect" });
  await a.wait(450);

  // 2. ...and draws a card: the rectangle grows under his cursor
  a.mark("draw");
  a.put({ alex: "draw0" });
  await a.wait(900);
  a.put({ alex: "draw1", rectOn: true, alexSel: true });
  await a.wait(1050);
  a.put({ tool: "select" });
  await a.wait(500);
  a.put({ alex: "rest" });

  // 3. Sam clicks into the card and types
  a.mark("type");
  a.put({ sam: "in" });
  await a.wait(1250);
  a.put({ samEdit: true });
  await a.wait(350);
  await a.type("samText", "Ship it", { interval: 120 });

  // 4. The payoff holds
  a.mark("hold");
  await a.wait(2500);

  // 5. Reset: their work leaves in one reverse stagger, text first
  a.mark("reset");
  a.put({ samEdit: false, samShow: false });
  await a.wait(320);
  a.put({ alexSel: false });
  await a.wait(120);
  a.put({ rectOn: false, sam: "rest" });
  await a.wait(700);
  // The text is invisible by now; clearing it and bringing the node back
  // changes nothing on screen, and the cursors keep gliding
  a.put({ samText: "" });
  await a.wait(60);
  a.put({ samShow: true });
  await a.wait(400);
  // Everything is at rest: hand `live` back so the loop ends where it began
  await a.snap({ live: false });
}

function alexSpot(
  at: AlexAt,
  rest: Rect,
  tool: Rect,
  slot: Rect,
): { x: number; y: number } {
  if (!rest.x || !slot.width) return { x: -100, y: -100 };
  if (at === "tool")
    return { x: tool.x + tool.width * 0.5, y: tool.y + tool.height * 0.55 };
  if (at === "draw0") return { x: slot.x, y: slot.y };
  if (at === "draw1")
    return { x: slot.x + slot.width, y: slot.y + slot.height };
  return { x: rest.x, y: rest.y };
}

function samSpot(at: SamAt, rest: Rect, note: Rect): { x: number; y: number } {
  if (!rest.x || !note.width) return { x: -100, y: -100 };
  if (at === "in") return { x: note.x + 10, y: note.y + note.height * 0.96 };
  return { x: rest.x, y: rest.y };
}

const TOOLS = [
  { id: "select", Icon: MousePointer2 },
  { id: "rect", Icon: Square },
  { id: "text", Icon: Type },
  { id: "image", Icon: ImageIcon },
] as const;

export function SessionHeroDemo() {
  return (
    <div
      role="img"
      aria-label="Two collaborators, Alex and Sam, working together on a shared Weave.js canvas: Alex draws a card and Sam types into it."
    >
      <HeroStage />
    </div>
  );
}

function HeroStage() {
  return (
    <Stage<S>
      width={640}
      height={360}
      fill
      palette="mono"
      initial={initial}
      poster={{
        live: true,
        alex: "rest",
        sam: "in",
        tool: "select",
        press: false,
        rectOn: true,
        alexSel: true,
        samEdit: true,
        samShow: true,
        samText: "Ship it",
      }}
      script={script}
      className="wv"
    >
      {(s, rect) => {
        const slot = rect("slot");
        const note = rect("note");
        const a = alexSpot(s.alex, rect("rest-alex"), rect("tool-rect"), slot);
        const m = samSpot(s.sam, rect("rest-sam"), note);
        return (
          <>
            <Window
              title="Roadmap"
              className="wv-win"
              toolbar={
                <Facepile
                  names={["Alex", "Sam"]}
                  size={20}
                  className="wv-pile"
                />
              }
            >
              <div className="wv-canvas">
                <div className="wv-tools">
                  {TOOLS.map(({ id, Icon }) => {
                    const active = id === s.tool;
                    const pressed = id === "rect" && s.press;
                    return (
                      <span
                        key={id}
                        className="wv-tool"
                        data-active={active || undefined}
                        data-pressed={pressed || undefined}
                        data-target={id === "rect" ? "tool-rect" : undefined}
                      >
                        <Icon size={16} strokeWidth={1.5} />
                      </span>
                    );
                  })}
                </div>

                <div className="wv-title">Homepage ideas</div>

                <div className="wv-card">
                  <div className="wv-img">
                    <ImageIcon size={18} strokeWidth={1.5} />
                  </div>
                  <div className="wv-cap">
                    <Bar w="76%" h={6} r={3} tone={2} />
                    <Bar w="48%" h={6} r={3} tone={2} />
                  </div>
                </div>

                {/* Filler that runs off the bottom: the window is cut there */}
                <div className="wv-card" data-low="a">
                  <div className="wv-img" />
                </div>
                <div className="wv-card" data-low="b">
                  <div className="wv-img" />
                </div>

                <div className="wv-circle" />

                <div className="wv-text">
                  <Bar w="100%" h={6} r={3} tone={2} />
                  <Bar w="86%" h={6} r={3} tone={2} />
                  <Bar w="94%" h={6} r={3} tone={2} />
                  <Bar w="58%" h={6} r={3} tone={2} />
                </div>

                {/* Where Alex's card ends up: the rect grows from its top-left */}
                <span className="wv-slot" data-target="slot" />
                <span
                  className="wv-rest"
                  data-who="alex"
                  data-target="rest-alex"
                />
                <span
                  className="wv-rest"
                  data-who="sam"
                  data-target="rest-sam"
                />
                <div
                  className="wv-rect"
                  data-on={s.rectOn || undefined}
                  data-sel={s.alexSel || undefined}
                  style={{ "--who": PEOPLE.alex } as CSSProperties}
                >
                  <span className="wv-handle" data-at="tl" />
                  <span className="wv-handle" data-at="tr" />
                  <span className="wv-handle" data-at="bl" />
                  <span className="wv-handle" data-at="br" />
                  <span
                    className="wv-note"
                    data-target="note"
                    data-typing
                    data-edit={s.samEdit || undefined}
                    data-show={s.samShow || undefined}
                    style={{ "--who": PEOPLE.sam } as CSSProperties}
                  >
                    {s.samText}
                    <span
                      className="wv-caret"
                      data-on={s.samEdit || undefined}
                      key={s.samText}
                    />
                  </span>
                </div>
              </div>
            </Window>
            <Peer name="Alex" color={PEOPLE.alex} at={a} live={s.live} />
            <Peer name="Sam" color={PEOPLE.sam} at={m} live={s.live} slow />
          </>
        );
      }}
    </Stage>
  );
}

function Peer({
  name,
  color,
  at,
  live,
  slow,
}: {
  name: string;
  color: string;
  at: { x: number; y: number };
  live: boolean;
  slow?: boolean;
}) {
  return (
    <span
      className="wv-peer"
      data-live={live || undefined}
      data-slow={slow || undefined}
      style={
        {
          transform: `translate(${at.x}px, ${at.y}px)`,
          "--who": color,
        } as CSSProperties
      }
    >
      <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden>
        <path
          d="M1.5 1.5v13.2l3.6-3.3 2.4 5.4 2.4-1-2.4-5.3h5.1Z"
          fill="var(--who)"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <span className="wv-flag">{name}</span>
    </span>
  );
}
