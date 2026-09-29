'use client';
import { useContext, useEffect, useState } from "react";
import SetThemeContext from "./ThemeContext";
import Cookies from "js-cookie";

export function ThemeWrapper({children}: any) {
    const [theme, setTheme] = useState<string>("default")
    
    useEffect(() => {
      // cookie-derived value is unavailable during SSR; set after mount to avoid hydration mismatch
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(Cookies.get('theme') ?? "default");
    }, [])

    const ThemeSet = (val: string) => {
        Cookies.set("theme", val);
        setTheme(val)
    }

    return (
            <body data-theme={theme} className='min-h-screen bg-base-200'>
                <SetThemeContext.Provider value={ThemeSet}>
                    {children}
                </SetThemeContext.Provider>
            </body>)
}

export const useMyContext = () => useContext(SetThemeContext);
