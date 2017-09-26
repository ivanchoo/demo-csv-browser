import React from "react";
import ToolBar from "./toolbar/ToolBar";
import Timeline from "./Timeline";
import Results from "./results/Results";
import CenterContent from "./components/CenterContent";
import { inject, observer } from "mobx-react";

const PORTAL_MIN_WIDTH = 768; // small devices, landscape
const TIMELINE_HEIGHT = 280;

@inject(["store"])
@observer
class App extends React.Component {
  componentDidMount() {
    const { store } = this.props;
    if (!store.changeLogsStatus.initialized) {
      store.fetch();
    } else {
      this.fetchStatsIfRequired();
    }
  }
  componentWillUpdate(nextProps) {
    this.fetchStatsIfRequired(nextProps);
  }
  fetchStatsIfRequired(props) {
    if (!props) {
      props = this.props;
    }
    const selectedChangeLog = props.store.selectedChangeLog;
    if (selectedChangeLog && !selectedChangeLog.asyncStatus.initialized) {
      selectedChangeLog.fetchStats().then(resp => {
        if (!selectedChangeLog.objectsAsyncStatus.initialized) {
          return selectedChangeLog.search(selectedChangeLog.query);
        }
      });
    }
  }
  render() {
    const { store } = this.props;
    const children = [
      <ToolBar
        key="toolbar"
        className="border border-top-0 border-left-0 border-right-0"
      />
    ];
    if (store.selectedChangeLog) {
      children.push(
        <Timeline key="timeline" style={{ height: TIMELINE_HEIGHT }} />
      );
      children.push(
        <Results
          key="results"
          className="border border-bottom-0 border-left-0 border-right-0"
          style={{ flex: 1 }}
        />
      );
    } else {
      children.push(
        <CenterContent key="empty">
          <code>Empty</code>
        </CenterContent>
      );
    }
    return (
      <div className="d-flex flex-column" style={styles.portal}>
        {children}
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
