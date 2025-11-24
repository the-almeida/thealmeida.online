import React from "react";
import { useTheme as useNextTheme } from "next-themes";
import { Switch } from "@nextui-org/react";

export const DarkModeSwitch = () => {
  const { setTheme, resolvedTheme } = useNextTheme();
  return (
    <div>
      <Switch
        isSelected={resolvedTheme === "dark" ? true : false}
        onValueChange={(e) => setTheme(e ? "dark" : "light")}
      >
        Tema escuro
      </Switch>
    </div>
  );
};
