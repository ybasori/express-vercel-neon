// FacebookProvider.tsx
import { useEffect } from "react";

const FacebookProvider = () => {
  useEffect(() => {
    // Load SDK if it hasn't already been added
    if (!(window as any).FB) {
      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.src =
        "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v23.0&appId=1282849900174718";
      document.body.appendChild(script);
    }
  }, []);

  return <div id="fb-root" />;
};

export default FacebookProvider;