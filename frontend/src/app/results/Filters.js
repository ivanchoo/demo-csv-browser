import React from "react";
import { inject, observer } from "mobx-react";

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
    return (
      <div
        {...restProps}
        className={`${className} d-flex flex-column bg-light`}
      >
        <nav
          className="navbar navbar-light bg-light border border-top-0 border-left-0 border-right-0"
          style={{ height: 58 }}
        >
          <span className="navbar-text">Results</span>
        </nav>
        <div
          className="p-3"
          style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
        >
          <FilterList
            stats={selectedChangeLog && selectedChangeLog.objectTypeStats}
            title="Object Types"
            onTargetClick={this.onTargetClick}
          />
          <hr />
          <FilterList
            stats={selectedChangeLog && selectedChangeLog.objectStats}
            title="Objects"
            onTargetClick={this.onTargetClick}
          />
        </div>
      </div>
    );
  }
}
