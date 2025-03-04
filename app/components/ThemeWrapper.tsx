'use client';

import { useContext, useEffect, useState } from "react";
import SetThemeContext from "./ThemeContext";

export function ThemeWrapper({children}: any) {
    const [theme, setTheme] = useState<string>("defualt")
    
    useEffect(() => {
      setTheme(localStorage.getItem("theme") ?? "default");
    }, [])

    const ThemeSet = (val: string) => {
        localStorage.setItem("theme", val);
        setTheme(val)
    }

    return (
        <html lang="en" data-theme={localStorage.getItem("theme")}>
            <body data-theme={theme} className='bg-base-200 min-h-screen h-'>
                <SetThemeContext.Provider value={ThemeSet}>
                    {children}
                </SetThemeContext.Provider>
            </body>
        </html>)
}

export const useMyContext = () => useContext(SetThemeContext);
