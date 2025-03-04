'use client';
import { useContext, useEffect, useState } from "react";
import SetThemeContext from "./ThemeContext";
import Cookies from "js-cookie";

export function ThemeWrapper({children}: any) {
    const storedTheme = Cookies.get('theme')
    const [theme, setTheme] = useState<string>("defualt")
    
    useEffect(() => {
      setTheme(Cookies.get('theme') ?? "default");
    }, [])

    const ThemeSet = (val: string) => {
        Cookies.set("theme", val);
        setTheme(val)
    }

    return (
            <body data-theme={theme} className='bg-base-200 min-h-screen h-'>
                <SetThemeContext.Provider value={ThemeSet}>
                    {children}
                </SetThemeContext.Provider>
            </body>)
}

export const useMyContext = () => useContext(SetThemeContext);
