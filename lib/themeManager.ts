export type ColorTheme = 'teal' | 'purple' | 'blue' | 'emerald' | 'rose' | 'amber';

export interface ThemeColors {
  primary: string;
  accent: string;
  charts: string[];
}

export const THEME_PRESETS: Record<ColorTheme, ThemeColors> = {
  teal: {
    primary: '185 75% 50%',
    accent: '35 90% 65%',
    charts: ['185 75% 45%', '210 88% 50%', '160 70% 48%', '35 90% 60%', '270 60% 55%']
  },
  purple: {
    primary: '258 85% 65%',
    accent: '280 75% 70%',
    charts: ['258 85% 35%', '210 88% 42%', '280 75% 40%', '180 65% 38%', '340 70% 45%']
  },
  blue: {
    primary: '210 90% 55%',
    accent: '195 85% 60%',
    charts: ['210 90% 45%', '220 85% 50%', '200 80% 48%', '230 75% 55%', '190 85% 52%']
  },
  emerald: {
    primary: '160 75% 45%',
    accent: '145 70% 55%',
    charts: ['160 75% 40%', '150 70% 45%', '170 65% 48%', '155 80% 42%', '165 75% 50%']
  },
  rose: {
    primary: '345 80% 60%',
    accent: '330 75% 65%',
    charts: ['345 80% 50%', '355 75% 55%', '335 70% 52%', '350 85% 58%', '340 78% 54%']
  },
  amber: {
    primary: '35 90% 55%',
    accent: '45 95% 60%',
    charts: ['35 90% 45%', '40 85% 50%', '30 88% 48%', '42 92% 52%', '38 87% 49%']
  }
};

export class ThemeManager {
  private static STORAGE_KEY = 'user_color_theme';

  static getCurrentTheme(): ColorTheme {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return (saved as ColorTheme) || 'teal';
  }

  static setTheme(theme: ColorTheme) {
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  static applyTheme(theme: ColorTheme) {
    const colors = THEME_PRESETS[theme];
    const root = document.documentElement;

    // Update CSS variables
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--ring', colors.primary);
    
    colors.charts.forEach((chart, i) => {
      root.style.setProperty(`--chart-${i + 1}`, chart);
    });
  }

  static initializeTheme() {
    const currentTheme = this.getCurrentTheme();
    this.applyTheme(currentTheme);
  }
}
