// "use client";
// import { useEffect } from "react";

// export default function DevfolioButton() {
//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src = "https://apply.devfolio.co/v2/sdk.js";
//     script.async = true;
//     script.defer = true;
//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   return (
//     <div
//       className="apply-button"
//       data-hackathon-slug="innerve-11"
//       data-button-theme="light"
//       style={{ height: "44px", width: "312px" }}
//     ></div>
//   );
// }

export default function DevfolioButton() {

  const handleClick = () => {
    window.open('https://unstop.com/o/PvyFs2j?lb=7ZSlAfI&utm_medium=Share&utm_source=WhatsApp', '_blank');
  }
  return (
    <button onClick={handleClick} className="flex text-stroke-h4 justify-center items-center text-[18px] sm:text-[20px] md:text-[22px] lg:text-[32px] w-fit py-2 px-12 bg-blue-500 rounded-2xl text-white font-sans font-semibold ">
      Apply With Unstop
    </button>
  );
}