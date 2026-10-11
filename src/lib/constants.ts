
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'LinkNest'
export const APP_URL = import.meta.env.VITE_APP_URL || 'https://linknest.example.com'

export const THEMES = [
  { id: 'light', name: 'Light', bg: '#fbfaf8', text: '#18181b' },
  { id: 'dark', name: 'Dark', bg: '#0f0f10', text: '#fafafa' },
  { id: 'sand', name: 'Sand', bg: '#fdf6ec', text: '#292524' },
  { id: 'midnight', name: 'Midnight', bg: '#0b0e1a', text: '#e2e8f0' },
  { id: 'forest', name: 'Forest', bg: '#f0fdf4', text: '#14532d' },
  { id: 'aurora', name: 'Aurora', bg: 'linear-gradient(135deg,#667eea,#764ba2)', text: '#ffffff' },
] as const

export const BUTTON_STYLES = [
  { id: 'rounded', label: 'Rounded', radius: 'rounded-2xl' },
  { id: 'pill', label: 'Pill', radius: 'rounded-full' },
  { id: 'sharp', label: 'Sharp', radius: 'rounded-none' },
  { id: 'soft', label: 'Soft', radius: 'rounded-xl' },
] as const
