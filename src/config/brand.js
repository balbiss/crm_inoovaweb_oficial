const rt = window.__APP_CONFIG__ || {}

export const brand = {
  apiUrl:       rt.apiUrl       || import.meta.env.VITE_API_URL            || 'http://localhost:3000',
  name:         rt.appName      || import.meta.env.VITE_APP_NAME           || 'CRM Imobiliário',
  logoUrl:      rt.logoUrl      || import.meta.env.VITE_APP_LOGO_URL       || '',
  primaryColor: rt.primaryColor || import.meta.env.VITE_APP_PRIMARY_COLOR  || '#1f93ff',
  accentColor:  rt.accentColor  || import.meta.env.VITE_APP_ACCENT_COLOR   || '#8b5cf6',
  supportEmail: rt.supportEmail || import.meta.env.VITE_APP_SUPPORT_EMAIL  || '',
  footerText:   rt.footerText   || import.meta.env.VITE_APP_FOOTER_TEXT    || '© 2025 CRM Imobiliário',
}
