import React from 'react';
import PropTypes from 'prop-types';
import { MainPanelMode } from '../actions';

import VisibleCourseSearchInput from '../containers/VisibleCourseSearchInput';
import VisibleCourseSearchList from '../containers/VisibleCourseSearchList';
import VisibleMainPanelSchedule from '../containers/VisibleMainPanelSchedule';

const MainPanelContent = ({currentMode}) => {
  switch (currentMode) {
  case MainPanelMode.COURSE_SEARCH:
    return (
        <React.Fragment>
        <VisibleCourseSearchInput />
        <VisibleCourseSearchList />
        </React.Fragment>
    );
  case MainPanelMode.SCHEDULE:
    return <VisibleMainPanelSchedule />;
  default:
    console.error(`Encountered unknown main panel mode ${currentMode}`);
    return <VisibleMainPanelSchedule />;
  }
};

export default MainPanelContent;
