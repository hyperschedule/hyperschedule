import * as controls_ from "../../Controls/actions";
export const controls = controls_;

export const SET_DATA = "App/Popup/ImportExport/SET_TEXT";
export const setData = data => ({
  type: SET_DATA,
  data,
});

export const APPLY_DATA = "App/Popup/ImportExport/APPLY_DATA";
export const applyData = () => ({
  type: APPLY_DATA,
});

export const CLOSE = "App/Popup/ImportExport/CLOSE";
export const close = () => ({
  type: CLOSE,
});
