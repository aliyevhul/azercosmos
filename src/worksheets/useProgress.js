import { useEffect, useState } from "react";
import { fetchProgress } from "./api";

// The signed-in user's progress on every fill-in worksheet:
// { <docId>: { filled, total, updatedAt } }, or null while loading / when
// there's no backend.
export default function useProgress() {
  const [progress, setProgress] = useState(null);
  useEffect(() => {
    let alive = true;
    fetchProgress()
      .then((data) => alive && setProgress(data.progress))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return progress;
}
