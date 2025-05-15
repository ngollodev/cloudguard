import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeType, lightTheme, darkTheme, Theme } from '../constants/theme';

type ThemeContextType = {
  theme: Theme;
  themeType: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeType: (type: ThemeType) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  themeType: 'light',
  isDark: false,
  toggleTheme: () => {},
  setThemeType: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>(colorScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    // Update theme based on system preferences, but only if user hasn't manually set it
    if (colorScheme) {
      setThemeType(colorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [colorScheme]);

  const toggleTheme = () => {
    setThemeType(themeType === 'dark' ? 'light' : 'dark');
  };

  const theme = themeType === 'dark' ? darkTheme : lightTheme;
  const isDark = themeType === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeType,
        isDark,
        toggleTheme,
        setThemeType,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);