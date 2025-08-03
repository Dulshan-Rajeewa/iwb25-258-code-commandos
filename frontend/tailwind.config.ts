import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				medical: {
					blue: 'hsl(var(--medical-blue))',
					green: 'hsl(var(--medical-green))',
					light: 'hsl(var(--medical-light))',
					success: 'hsl(var(--medical-success))',
					warning: 'hsl(var(--medical-warning))',
					accent: 'hsl(var(--medical-accent))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'medical': 'var(--shadow-medical)',
				'card-enhanced': 'var(--shadow-card)',
				'glow-blue': '0 0 20px hsl(var(--medical-blue) / 0.3)',
				'glow-green': '0 0 20px hsl(var(--medical-green) / 0.3)',
				'glow-medical': '0 0 30px hsl(var(--medical-blue) / 0.4), 0 0 60px hsl(var(--medical-green) / 0.2)'
			},
			backgroundImage: {
				'gradient-medical': 'var(--gradient-primary)',
				'gradient-medical-light': 'var(--gradient-light)',
				'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'theme-enter': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95) rotate(1deg)'
					},
					'50%': {
						opacity: '0.5',
						transform: 'scale(1.02) rotate(-0.5deg)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1) rotate(0deg)'
					}
				},
				'theme-exit': {
					'0%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'100%': {
						opacity: '0',
						transform: 'scale(0.98)'
					}
				},
				'pulse-medical': {
					'0%, 100%': {
						boxShadow: '0 0 0 0 hsl(var(--medical-blue) / 0.4)'
					},
					'50%': {
						boxShadow: '0 0 0 10px hsl(var(--medical-blue) / 0)'
					}
				},
				'glow-medical': {
					'0%': {
						boxShadow: '0 0 5px hsl(var(--medical-blue) / 0.3)'
					},
					'100%': {
						boxShadow: '0 0 20px hsl(var(--medical-blue) / 0.6), 0 0 30px hsl(var(--medical-green) / 0.4)'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'theme-enter': 'theme-enter 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
				'theme-exit': 'theme-exit 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'pulse-medical': 'pulse-medical 2s infinite',
				'glow-medical': 'glow-medical 3s ease-in-out infinite alternate',
				'shimmer': 'shimmer 1.5s infinite',
				'float': 'float 3s ease-in-out infinite'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
