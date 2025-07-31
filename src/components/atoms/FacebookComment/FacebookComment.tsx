// FacebookComments.tsx
import { useEffect } from "react";

interface FacebookCommentsProps {
  url: string;
  numPosts?: number;
  width?: string;
}

const FacebookComment = ({ url, numPosts = 5, width = "100%" }: FacebookCommentsProps) => {
  useEffect(() => {
    if ((window as any).FB) {
      (window as any).FB.XFBML.parse();
    }
  }, [url]);

  return (
    <div
      className="fb-comments"
      data-href={url}
      data-width={width}
      data-numposts={numPosts}
    ></div>
  );
};

export default FacebookComment