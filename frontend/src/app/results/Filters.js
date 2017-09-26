import React from "react";
import { inject, observer } from "mobx-react";
import ProgressBox from "../components/ProgressBox";
import CenterContent from "../components/CenterContent";

class FilterList extends React.Component {
  render() {
    const { stats, title, onTargetClick } = this.props;
    if (!stats || !stats.length) {
      return null;
    } else {
      return (
        <section>
          <h6>{title}</h6>
          <ul className="list-unstyled">
            {stats.map(({ target, value }) => {
              return (
                <li key={target}>
                  <span className="badge badge-pill badge-warning">
                    {value}
                  </span>{" "}
                  <a href="#" onClick={onTargetClick} data-target={target}>
                    {target}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      );
    }
  }
}

@inject(["store"])
@observer
export default class Filters extends React.Component {
  onTargetClick = evt => {
    evt.preventDefault();
    const target = evt.target.dataset["target"] || null;
    const selectedChangeLog = this.props.store.selectedChangeLog;
    if (selectedChangeLog) {
      selectedChangeLog.updateQuery({ target });
    }
  };
  render() {
    const { className = "", store, ...restProps } = this.props;
    const selectedChangeLog = store.selectedChangeLog;
    const containerProps = {
      className: `${className} d-flex flex-column bg-light`,
      ...restProps
    };
    if (!selectedChangeLog) {
      return <div {...containerProps} />;
    } else if (selectedChangeLog.objectStatsAsyncStatus.progress) {
      return <ProgressBox {...containerProps} />;
    } else if (!selectedChangeLog.objectStatsTotal) {
      return (
        <CenterContent {...containerProps}>
          <small className="text-secondary">No Results</small>
        </CenterContent>
      );
    }
    const children = [];
    if (selectedChangeLog.objectTypeStats.length) {
      children.push(
        <FilterList
          key="filters-object-types"
          stats={selectedChangeLog.objectTypeStats}
          title="Object Types"
          onTargetClick={this.onTargetClick}
        />
      );
    }
    if (selectedChangeLog.objectStats.length) {
      if (children.length) {
        children.push(<hr key="separator" />);
      }
      children.push(
        <FilterList
          key="filters-objects"
          stats={selectedChangeLog.objectStats}
          title="Objects"
          onTargetClick={this.onTargetClick}
        />
      );
    }
    return (
      <div {...containerProps}>
        <nav
          className="navbar navbar-light bg-light border border-top-0 border-left-0 border-right-0"
          style={{ height: 58 }}
        >
          <span className="navbar-text">
            Total: {selectedChangeLog.objectStatsTotal}
          </span>
        </nav>
        <div
          className="p-3"
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
        >
          {children}
        </div>
      </div>
    );
  }
}
