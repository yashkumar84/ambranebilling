// Theme configuration
export const themes = {
    teal: {
        name: 'Teal Elegance',
        primary: '174 100% 9%',      // #062925
        primaryLight: '173 100% 15%',
        secondary: '171 48% 41%',     // #3A9188
        secondaryLight: '171 48% 51%',
        accent: '171 48% 85%',
        accentLight: '171 48% 90%',
        background: '174 100% 4%',    // Darker teal background
        foreground: '0 0% 98%',
        card: '174 100% 7%',
        cardForeground: '0 0% 98%',
        border: '174 50% 15%',
        muted: '174 50% 10%',
        mutedForeground: '174 20% 70%',
    },
    pastel: {
        name: 'Pastel Dream',
        primary: '182 45% 42%',       // Slightly darker
        primaryLight: '182 35% 71%',
        secondary: '217 38% 38%',     // Darker for contrast
        secondaryLight: '217 28% 62%',
        accent: '0 47% 75%',
        accentLight: '0 47% 90%',
        background: '182 30% 98%',
        foreground: '182 60% 10%',
        card: '0 0% 100%',
        cardForeground: '182 60% 10%',
        border: '182 30% 90%',
        muted: '182 30% 96%',
        mutedForeground: '182 20% 35%', // Darker for readability
    },
    sky: {
        name: 'Sky Blue',
        primary: '218 50% 40%',       // Darker
        primaryLight: '218 60% 74%',
        secondary: '199 65% 42%',     // Darker
        secondaryLight: '199 75% 77%',
        accent: '192 43% 82%',
        accentLight: '45 100% 92%',
        background: '218 40% 98%',
        foreground: '218 60% 12%',
        card: '0 0% 100%',
        cardForeground: '218 60% 12%',
        border: '218 40% 90%',
        muted: '218 40% 96%',
        mutedForeground: '218 20% 35%', // Darker
    },
    default: {
        name: 'Blue Ocean',
        primary: '221.2 83.2% 53.3%',
        primaryLight: '199 89% 48%',
        secondary: '24.6 95% 45.1%',  // Darker
        secondaryLight: '24.6 95% 53.1%',
        accent: '142.1 76.2% 36.3%',
        accentLight: '142.1 70.6% 45.3%',
        background: '222 47% 11%',    // Dark blue background
        foreground: '210 40% 98%',
        card: '222 47% 15%',
        cardForeground: '210 40% 98%',
        border: '217 32% 17%',
        muted: '222 47% 14%',
        mutedForeground: '215 20% 65%',
    },
    forest: {
        name: 'Forest Green',
        primary: '142.1 76.2% 36.3%',
        primaryLight: '142.1 70.6% 45.3%',
        secondary: '24.6 95% 43.1%',  // Darker
        secondaryLight: '24.6 95% 53.1%',
        accent: '221.2 83.2% 53.3%',
        accentLight: '199 89% 48%',
        background: '143 45% 5%',     // Very dark green
        foreground: '143 20% 98%',
        card: '143 45% 8%',
        cardForeground: '143 20% 98%',
        border: '143 40% 15%',
        muted: '143 45% 7%',
        mutedForeground: '143 15% 70%',
    },
    sunset: {
        name: 'Sunset Orange',
        primary: '24.6 95% 40.1%',    // Darker
        primaryLight: '24.6 95% 53.1%',
        secondary: '0 84.2% 45.2%',   // Darker
        secondaryLight: '0 84.2% 60.2%',
        accent: '45 93% 47%',
        accentLight: '45 93% 57%',
        background: '25 40% 98%',
        foreground: '25 60% 10%',
        card: '0 0% 100%',
        cardForeground: '25 60% 10%',
        border: '25 40% 90%',
        muted: '25 40% 96%',
        mutedForeground: '25 10% 35%', // Darker
    },
    ocean: {
        name: 'Deep Ocean',
        primary: '199 89% 38%',       // Darker
        primaryLight: '199 89% 48%',
        secondary: '280 70% 50%',     // Darker
        secondaryLight: '280 100% 70%',
        accent: '142.1 76.2% 36.3%',
        accentLight: '142.1 70.6% 45.3%',
        background: '199 89% 5%',     // Darkest blue
        foreground: '199 30% 98%',
        card: '199 89% 8%',
        cardForeground: '199 30% 98%',
        border: '199 50% 15%',
        muted: '199 89% 7%',
        mutedForeground: '199 20% 70%',
    },
}

export type ThemeName = keyof typeof themes

export function applyTheme(themeName: ThemeName) {
    const theme = themes[themeName]
    const root = document.documentElement

    // Primary & Brand Colors
    root.style.setProperty('--primary', theme.primary)
    root.style.setProperty('--primary-light', theme.primaryLight)
    root.style.setProperty('--secondary', theme.secondary)
    root.style.setProperty('--secondary-light', theme.secondaryLight)
    root.style.setProperty('--accent', theme.accent)
    root.style.setProperty('--accent-light', theme.accentLight)

    // Semantic Colors
    root.style.setProperty('--color-background', `hsl(${theme.background})`)
    root.style.setProperty('--color-foreground', `hsl(${theme.foreground})`)
    root.style.setProperty('--color-card', `hsl(${theme.card})`)
    root.style.setProperty('--color-card-foreground', `hsl(${theme.cardForeground})`)
    root.style.setProperty('--color-border', `hsl(${theme.border})`)
    root.style.setProperty('--color-muted', `hsl(${theme.muted})`)
    root.style.setProperty('--color-muted-foreground', `hsl(${theme.mutedForeground})`)

    // Tailored for Tailwind v4 mapping (which expects hsl(...) or raw colors)
    root.style.setProperty('--primary-hsl', theme.primary)
    root.style.setProperty('--secondary-hsl', theme.secondary)
    root.style.setProperty('--accent-hsl', theme.accent)

    // Save to localStorage
    if (typeof window !== 'undefined') {
        localStorage.setItem('theme', themeName)
    }
}

export function getStoredTheme(): ThemeName {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('theme') as ThemeName
        return stored && themes[stored] ? stored : 'pastel'
    }
    return 'pastel'
}

