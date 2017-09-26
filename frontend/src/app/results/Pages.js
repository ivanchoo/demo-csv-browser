import React from "react";
import { inject, observer } from "mobx-react";
import m from "moment";
import Pagination from "./Pagination";
import ProgressBox from "../components/ProgressBox";
import Spinner from "../components/Spinner";
import CenterContent from "../components/CenterContent";

const StylisedChanges = ({ changes }) => {
  if (!changes) {
    return <small className="text-secondary">n/a</small>;
  }
  const obj = JSON.parse(changes);
  const children = Object.keys(obj).map(k => {
    const v = obj[k];
    const label = `${k}:${v}`;
    return (
      <li key={label} className="list-inline-item">
        <span className="badge badge-light">{label}</span>
      </li>
    );
  });
  return <ul className="h5 list-inline">{children}</ul>;
};

@inject(["store"])
@observer
export default class Pages extends React.Component {
  onTargetClick = evt => {
    const target = evt.target.dataset["target"];
    const selectedChangeLog = this.props.store.selectedChangeLog;
    if (selectedChangeLog) {
      selectedChangeLog.updateQuery({ target });
    }
  };
  onGoto = page => {
    const selectedChangeLog = this.props.store.selectedChangeLog;
    if (!selectedChangeLog) return;
    selectedChangeLog.goto(page);
  };
  onDisplayAsSourceClick = evt => {
    const { store } = this.props;
    store.wantsDisplayAsSource(!store.displayAsSource);
  };
  render() {
    const { className = "", store, ...restProps } = this.props;
    const containerProps = {
      ...restProps,
      className: `${className} d-flex flex-column`
    };
    const selectedChangeLog = store.selectedChangeLog;
    if (
      !selectedChangeLog ||
      !selectedChangeLog.objectsAsyncStatus.initialized
    ) {
      return (
        <div {...containerProps}>
          <ProgressBox style={{ width: "100%", height: "100%" }} />
        </div>
      );
    }
    const results = selectedChangeLog.currentObjects;
    const hasResults = !!(results && results.length);
    let children;
    if (hasResults) {
      const displayAsSource = store.displayAsSource;
      children = (
        <table className="table">
          <tbody>
            {results.map(log => {
              const { id, object_type, changes, datetime } = log;
              const uid = `${object_type}:${id}`;
              const dt = m(datetime);
              const children = displayAsSource ? (
                <code>{changes}</code>
              ) : (
                <StylisedChanges changes={changes} />
              );
              return (
                <tr key={uid}>
                  <td style={{ width: "20%", textAlign: "right" }}>
                    <a href="#" data-target={uid} onClick={this.onTargetClick}>
                      {uid}
                    </a>
                  </td>
                  <td style={{ width: "30%" }}>
                    {dt.isValid()
                      ? dt.local().format("Do MMMM YYYY, h:mm:ss a")
                      : "Invalid Date"}
                  </td>
                  <td>{children}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    } else {
      children = (
        <CenterContent style={{ height: "100%" }}>
          <small className="text-secondary">No Results</small>
        </CenterContent>
      );
    }
    return (
      <div {...containerProps}>
        <nav
          className="navbar navbar-light bg-light justify-content-between border border-top-0 border-left-0 border-right-0"
          style={{ height: 58 }}
        >
          <form className="form-inline">
            <button
              className={`btn btn-sm align-middle btn-outline-secondary ${store.displayAsSource
                ? "active"
                : ""}`}
              data-toggle="button"
              aria-pressed="false"
              autoComplete="off"
              type="button"
              onClick={this.onDisplayAsSourceClick}
            >
              View Source
            </button>
          </form>
          <div className="d-flex align-items-center">
            <Spinner visible={selectedChangeLog.objectsAsyncStatus.progress} />
            <Pagination
              pages={selectedChangeLog.pages}
              current={selectedChangeLog.currentPage}
              goto={this.onGoto}
              disabled={!selectedChangeLog.objectsAsyncStatus.ready}
            />
          </div>
        </nav>
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {children}
        </div>
      </div>
    );
  }
}
