import { useState, useEffect } from "react";

export function useAppTheme() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Logic to determine the theme
    const currentTheme = localStorage.getItem("theme") || "light";
    setTheme(currentTheme);
  }, []);

  return theme === "light" ? "bg-white" : "bg-gray-600";
}
