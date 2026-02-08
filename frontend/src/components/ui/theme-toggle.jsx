import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <Button className="h-[31px] w-[31px] border-none shadow-none hover:bg-trasnsparent hover:text-primary hover:cursor-pointer transition-all duration-800 " variant="ghost" size="icon" onClick={() => setDark(!dark)} >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
