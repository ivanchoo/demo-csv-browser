import React from "react";
import { inject, observer } from "mobx-react";
import Filters from "./Filters";
import Pages from "./Pages";
import CenterContent from "../components/CenterContent";
import ProgressBox from "../components/ProgressBox";

@inject(["store"])
@observer
export default class Results extends React.Component {
  render() {
    const { className = "", store, ...restProps } = this.props;
    const containerProps = { ...restProps, className: `d-flex ${className}` };
    const selectedChangeLog = store.selectedChangeLog;
    const isReady = !selectedChangeLog || !selectedChangeLog.asyncStatus.ready;
    if (isReady) {
      return <ProgressBox {...containerProps} />;
    }
    if (selectedChangeLog.objectStatsAsyncStatus.progress) {
      // Is fetching object stats, don't show underlying ui
      return <ProgressBox {...containerProps} />;
    } else if (
      selectedChangeLog.objectStatsAsyncStatus.initialized &&
      selectedChangeLog.objectsAsyncStatus.initialized
    ) {
      // Object has been searched, if no results, just cover the ui with notice
      if (
        !selectedChangeLog.currentObjects ||
        !selectedChangeLog.currentObjects.length
      ) {
        return (
          <CenterContent {...containerProps}>
            <small className="text-secondary">No Results</small>
          </CenterContent>
        );
      }
    }

    return (
      <div {...containerProps}>
        <Filters
          className="border border-top-0 border-left-0 border-bottom-0"
          style={{ width: 220 }}
        />
        <Pages style={{ flex: 1 }} />
      </div>
    );
  }
}
