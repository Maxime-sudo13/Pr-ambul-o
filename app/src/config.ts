// Marque, contact et prix : tout se modifie dans brand.json à la racine.
import brand from '../../brand.json'

export const BRAND = brand
export const PRODUCT_NAME = brand.name
export const TAGLINE = brand.tagline
/** Adresse du site vitrine. En développement, il tourne sur un autre port. */
export const SITE_URL: string = import.meta.env.DEV ? 'http://localhost:5173/' : (import.meta.env.VITE_SITE_URL ?? brand.siteUrl)
