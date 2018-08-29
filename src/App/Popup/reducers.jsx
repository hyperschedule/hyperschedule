import Mode from "./mode";
import {Map} from "immutable";
import * as actions from "./actions";

export default (
  state = Map({
    mode: "",
    visible: false,
  }),
  action,
) => {
  switch (action.type) {
    case actions.importExport.CLOSE:
    case actions.CLOSE:
      return state.set("visible", false);

    case actions.controls.SHOW_HELP:
      return state.merge({
        mode: Mode.HELP,
        visible: true,
      });
    case actions.controls.SHOW_IMPORT_EXPORT:
      return state.merge({
        mode: Mode.IMPORT_EXPORT,
        visible: true,
      });
    case actions.importExport.EXPORT_PDF:
      return state.merge({mode: Mode.EXPORT_PDF, visible: true});
    case actions.importExport.EXPORT_ICS:
      return state.merge({mode: Mode.EXPORT_ICS, visible: true});

    default:
      return state;
  }
};
