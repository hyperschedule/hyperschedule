import * as actions from './actions';

export const mode = (
    state = actions.Mode.SCHEDULE,
    action
) => (
    action.type == actions.SET_MODE ? (
        action.mode
    ) : (
        state
    )
);


