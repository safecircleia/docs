import { defineI18n } from 'fumadocs-core/i18n';
import { uiTranslations } from 'fumadocs-ui/i18n';

export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'es'],
});

export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .add('ui', {
    en: {
      displayName: 'English',
    },
    es: {
      displayName: 'Español',
      search: 'Buscar',
      searchOpen: 'Buscar',
      searchClose: 'Cerrar',
      searchNoResult: 'Sin resultados',
      toc: 'En esta página',
      tocNoHeadings: 'Sin encabezados',
      nextPage: 'Siguiente',
      previousPage: 'Anterior',
      chooseLanguage: 'Idioma',
      chooseTheme: 'Tema',
      lastUpdate: 'Última actualización',
      editOnGithub: 'Editar en GitHub',
      themeLight: 'Claro',
      themeDark: 'Oscuro',
      themeSystem: 'Sistema',
      menuToggle: 'Menú',
      sidebarOpen: 'Abrir barra lateral',
      sidebarCollapse: 'Colapsar barra lateral',
    },
  });
