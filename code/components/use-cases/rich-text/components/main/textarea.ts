export const createTextarea = (): void => {
  let textarea: HTMLTextAreaElement | null =
    document.querySelector("#text-edition");

  if (!textarea) {
    textarea = document.createElement("textarea");

    Object.assign(textarea.style, {
      position: "absolute",
      opacity: "0",
      left: "-9999px",
      top: "0",
      width: "1px",
      height: "1px",
      resize: "none",
      overflow: "hidden",
      whiteSpace: "pre",
      pointerEvents: "none",
    });

    textarea.setAttribute("id", "text-edition");
    textarea.setAttribute("aria-hidden", "true");

    document.body.appendChild(textarea);
  }

  textarea.focus();
};

export const destroyTextarea = (): void => {
  const textarea: HTMLTextAreaElement | null =
    document.querySelector("#text-edition");

  if (textarea) {
    textarea.remove();
  }
};

export const focusTextarea = (): void => {
  const textarea: HTMLTextAreaElement | null =
    document.querySelector("#text-edition");

  if (textarea) {
    textarea.focus();
  }
};
