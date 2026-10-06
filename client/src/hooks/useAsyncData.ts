import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../services/apiClient";

type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: T };

// Loads data once and exposes loading, error and ready states.
// The loader must be a stable function, for example one imported from a service file.
export function useAsyncData<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((data) => {
        if (!cancelled) {
          setState({ status: "ready", data });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message =
            error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
          setState({ status: "error", message });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loader, attempt]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((count) => count + 1);
  }, []);

  return { state, reload };
}