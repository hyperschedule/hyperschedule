import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'semantic-ui-react';
import { MainPanelMode } from '../actions.js';

const MainPanelModeSelector = ({onClick, currentMode}) => {
  return (
    <Button.Group widths='2' attached='top'>
      <Button icon
              labelPosition='left'
              onClick={onClick}
              mode={MainPanelMode.COURSE_SEARCH}
              primary={currentMode === MainPanelMode.COURSE_SEARCH}>
        <Icon name='add to calendar' />
        Course Search
      </Button>
      <Button icon
              labelPosition='right'
              onClick={onClick}
              mode={MainPanelMode.SCHEDULE}
              primary={currentMode === MainPanelMode.SCHEDULE}>
        Schedule
        <Icon name='calendar' />
      </Button>
    </Button.Group>
  );
};

MainPanelModeSelector.propTypes = {
  onClick: PropTypes.func.isRequired,
  currentMode: PropTypes.string.isRequired
};

export default MainPanelModeSelector;
