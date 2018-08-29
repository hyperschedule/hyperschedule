export const SHOW_POPUP = "App/Controls.SHOW_POPUP";
export const showPopup = (title, content) => ({
  type: SHOW_POPUP,
  title,
  content,
});

export const SHOW_HELP = "App/Controls.SHOW_HELP";
export const showHelp = () => ({
  type: SHOW_HELP,
});

export const SHOW_IMPORT_EXPORT = "App/Controls.SHOW_IMPORT_EXPORT";
export const showImportExport = () => ({
  type: SHOW_IMPORT_EXPORT,
});
