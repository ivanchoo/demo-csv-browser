import React from "react";
import Timeline from "./Timeline";
import Filters from "./Filters";
import Details from "./Details";

class App extends React.Component {
  render() {
    return (
      <div style={styles.portal}>
        <Timeline style={styles.timeline} />
        <Filters style={styles.filters} />
        <Details style={styles.details} />
      </div>
    );
  }
}

const TIMELINE_HEIGHT = 280;
const FILTER_WIDTH = 240;

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
    minWidth: 540
  }),
  timeline: greedy({
    bottom: null,
    height: TIMELINE_HEIGHT
  }),
  filters: greedy({
    right: null,
    top: TIMELINE_HEIGHT,
    width: FILTER_WIDTH
  }),
  details: greedy({
    left: FILTER_WIDTH,
    top: TIMELINE_HEIGHT
  })
};

export default App;
