import React from "react";
import { inject, observer } from "mobx-react";
import m from "moment";
import Pagination from "./Pagination";
import ProgressBox from "../components/ProgressBox";
import CenterContent from "../components/CenterContent";

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
  render() {
    const { className = "", store, ...restProps } = this.props;
    const containerProps = {
      ...restProps,
      className: `${className} d-flex flex-column`
    };
    const selectedChangeLog = store.selectedChangeLog;
    if (!selectedChangeLog || !selectedChangeLog.objectsAsyncStatus.ready) {
      return <div {...containerProps} />;
    }
    const results = selectedChangeLog.currentObjects;
    const hasResults = !!(results && results.length);
    let children;
    if (selectedChangeLog.objectsAsyncStatus.progress) {
      children = <ProgressBox style={{ height: "100%" }} />;
    } else if (hasResults) {
      children = (
        <table className="table">
          <tbody>
            {results.map(log => {
              const { id, object_type, changes, datetime } = log;
              const uid = `${object_type}:${id}`;
              const dt = m(datetime);
              return (
                <tr key={uid}>
                  <td style={{ width: "20%", textAlign: "right" }}>
                    <a href="#" data-target={uid} onClick={this.onTargetClick}>
                      {uid}
                    </a>
                  </td>
                  <td style={{ width: "30%" }}>
                    {dt.isValid()
                      ? dt.local().format("Do MMMM YYYY")
                      : "Invalid Date"}
                  </td>
                  <td>
                    <code>{changes}</code>
                  </td>
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
          className="navbar navbar-light bg-light border border-top-0 border-left-0 border-right-0"
          style={{ height: 58 }}
        >
          <Pagination
            pages={selectedChangeLog.pages}
            current={selectedChangeLog.currentPage}
            goto={this.onGoto}
          />
          <form className="form-inline">
            <button
              className="btn btn-sm align-middle btn-outline-secondary"
              type="button"
            >
              Smaller button
            </button>
          </form>
        </nav>
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {children}
        </div>
      </div>
    );
  }
}
