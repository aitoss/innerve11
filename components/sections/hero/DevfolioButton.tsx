"use client";

import { useEffect } from "react";

export default function DevfolioButton() {
  /* Step 1 (Usage with React): dynamically load the Devfolio SDK script */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://apply.devfolio.co/v2/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  /* Step 2: Devfolio button element */
  return (
    <div
      className="apply-button"
      data-hackathon-slug="innerve-11"
      data-button-theme="light"
      style={{ height: "44px", width: "312px" }}
    />
  );
}
