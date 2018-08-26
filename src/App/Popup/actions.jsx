import * as controls_ from "../Controls/actions";
export const controls = controls_;

import * as importExport_ from "./ImportExport/actions";
export const importExport = importExport_;

export const CLOSE = "App/Popup/CLOSE";
export const close = () => ({
  type: CLOSE,
});
