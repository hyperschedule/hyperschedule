import React from 'react';
import PropTypes from 'prop-types';
import { MainPanelMode } from '../actions';
import MainPanelCourseSearch from './MainPanelCourseSearch';
import MainPanelSchedule from './MainPanelSchedule';

const MainPanelContent = ({currentMode}) => {
  switch (currentMode) {
  case MainPanelMode.COURSE_SEARCH:
    return <MainPanelCourseSearch />;
  case MainPanelMode.SCHEDULE:
    return <MainPanelSchedule />;
  default:
    console.error(`Encountered unknown main panel mode ${currentMode}`);
    return <MainPanelSchedule />;
  }
};

export default MainPanelContent;
