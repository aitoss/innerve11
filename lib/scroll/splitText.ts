/** Splits text nodes inside an element into `.word > .ch` spans for GSAP stagger reveals. */
export function splitChars(el: HTMLElement): void {
  const walk = (node: HTMLElement | Node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        (n.textContent || "").split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          const word = document.createElement("span");
          word.className = "word";
          [...w].forEach((c) => {
            const ch = document.createElement("span");
            ch.className = "ch";
            ch.textContent = c;
            word.appendChild(ch);
          });
          frag.appendChild(word);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        walk(n as HTMLElement);
      }
    });
  };
  walk(el);
}

