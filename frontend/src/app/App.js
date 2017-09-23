import React from "react";
import Timeline from "./Timeline";
import Filters from "./Filters";
import Details from "./Details";
import ToolBar from "./ToolBar";

class App extends React.Component {
  render() {
    return (
      <div className="container-fluid" style={styles.portal}>
        <ToolBar className="border border-top-0 border-left-0 border-right-0" />
        <Timeline
          className="border border-top-0 border-left-0 border-right-0"
          style={styles.timeline}
        />
        <Details style={styles.details} />
        <Filters
          className="border border-top-0 border-left-0 border-bottom-0 bg-light"
          style={styles.filters}
        />
      </div>
    );
  }
}

const PORTAL_MIN_WIDTH = 768; // small devices, landscape
const TIMELINE_HEIGHT = 280;
const FILTER_WIDTH = 240;
const TOOLBAR_HEIGHT = 85;

const greedy = props => {
  return {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    ...props
  };
};

const styles = {
  portal: greedy({
    minWidth: PORTAL_MIN_WIDTH
  }),
  timeline: greedy({
    top: TOOLBAR_HEIGHT,
    bottom: null,
    height: TIMELINE_HEIGHT
  }),
  filters: greedy({
    right: null,
    top: TOOLBAR_HEIGHT + TIMELINE_HEIGHT,
    width: FILTER_WIDTH
  }),
  details: greedy({
    left: FILTER_WIDTH,
    top: TOOLBAR_HEIGHT + TIMELINE_HEIGHT
  })
};

export default App;
