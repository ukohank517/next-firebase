// src/app/theme.ts
import { createSystem, defaultConfig } from "@chakra-ui/react"
export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#f7fafc' },
          100: { value: '#edf2f7' },
          500: { value: '#319795' },
          900: { value: '#1a202c' },
        },
      },
      fonts: {
        body: { value: 'system-ui, sans-serif' },
        heading: { value: 'system-ui, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: '{colors.brand.500}' },
          contrast: { value: '{colors.brand.100}' },
          fg: { value: '{colors.brand.700}' },
          muted: { value: '{colors.brand.100}' },
          subtle: { value: '{colors.brand.200}' },
          emphasized: { value: '{colors.brand.300}' },
          focusRing: { value: '{colors.brand.500}' },
        },
      },
    },
  },
})