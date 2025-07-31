import { useEffect, useState } from "react";

export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePathChange = () => {
      setPathname(window.location.pathname);
    };

    // Patch pushState & replaceState to fire events
    const wrapHistoryMethod = (method: "pushState" | "replaceState") => {
      const original = history[method];
      history[method] = function (...args) {
        const result = original.apply(this, args);
        window.dispatchEvent(new Event("locationchange"));
        return result;
      };
    };

    wrapHistoryMethod("pushState");
    wrapHistoryMethod("replaceState");

    window.addEventListener("popstate", handlePathChange);
    window.addEventListener("locationchange", handlePathChange);

    return () => {
      window.removeEventListener("popstate", handlePathChange);
      window.removeEventListener("locationchange", handlePathChange);
    };
  }, []);

  return pathname;
}
