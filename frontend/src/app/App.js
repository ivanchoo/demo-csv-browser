import React from "react";
import ToolBar from "./ToolBar";
import Timeline from "./Timeline";
import Results from "./Results";
import { inject } from "mobx-react";

const PORTAL_MIN_WIDTH = 768; // small devices, landscape
const TIMELINE_HEIGHT = 280;

@inject(["store"])
class App extends React.Component {
  componentDidMount() {
    const { store } = this.props;
    if (store.status != "success") {
      store.fetch();
    }
  }
  render() {
    return (
      <div className="d-flex flex-column" style={styles.portal}>
        <ToolBar className="border border-top-0 border-left-0 border-right-0" />
        <Timeline style={{ height: TIMELINE_HEIGHT }} />
        <Results
          className="border border-bottom-0 border-left-0 border-right-0"
          style={{ flex: 1 }}
        />
      </div>
    );
  }
}

const styles = {
  portal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    minWidth: PORTAL_MIN_WIDTH
  }
};

export default App;
