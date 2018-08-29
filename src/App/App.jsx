import React from "react";

import Controls from "./Controls/Controls";
import CourseDescription from "./CourseDescription/CourseDescription";
import CourseSearch from "./CourseSearch/CourseSearch";
import CreditCount from "./CreditCount/CreditCount";
import ExportICS from "./ExportICS/ExportICS";
import ExportPDF from "./ExportPDF/ExportPDF";
import Help from "./Help/Help";
import ImportExport from "./ImportExport/ImportExport";
import ModeSelector from "./ModeSelector/ModeSelector";
import Schedule from "./Schedule/Schedule";
import SelectedCourses from "./SelectedCourses/SelectedCourses";

import "./App.css";

function App() {
  return (
    <div id="app">
      <div className="columns">
        <div className="mode column">
          <div className="selector container">
            <ModeSelector />
          </div>
          <div className="content container">
            <CourseSearch />
            <Schedule />
          </div>
        </div>
        <div className="sidebar column">
          <Controls />
          <CourseDescription />
          <SelectedCourses />
          <CreditCount />
        </div>
      </div>
      <div className="popups">
        <Help />
        <ImportExport />
        <ExportPDF />
        <ExportICS />
      </div>
    </div>
  );
}

export default App;
