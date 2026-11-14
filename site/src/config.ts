// Marque, contact et prix : tout se modifie dans brand.json à la racine.
import brand from '../../brand.json'

export const BRAND = brand
/** Adresse de l'application (démo). En développement, elle tourne sur un autre port. */
export const APP_URL: string = import.meta.env.DEV ? 'http://localhost:5174/' : (import.meta.env.VITE_APP_URL ?? brand.appUrl)
