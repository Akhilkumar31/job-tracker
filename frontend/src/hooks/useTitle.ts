import { useEffect } from "react";

export function useTitle(page: string) {
  useEffect(() => {
    const base = "Job Tracker";
    document.title = page === "Home" ? base : `${page} | ${base}`;
  }, [page]);
}
