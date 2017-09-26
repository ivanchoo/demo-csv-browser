import React from "react";
import { inject, observer } from "mobx-react";
import m from "moment";

@inject(["store"])
@observer
export default class Details extends React.Component {
  state = {
    page: 0
  };
  onTargetClick = evt => {
    const target = evt.target.dataset["target"];
    const selectedChangeLog = this.props.store.selectedChangeLog;
    if (selectedChangeLog) {
      selectedChangeLog.updateQuery({ target });
    }
  };
  render() {
    const { className = "", store, ...restProps } = this.props;
    const { page } = this.state;
    const selectedChangeLog = store.selectedChangeLog;
    if (!selectedChangeLog) {
      return <code>Empty</code>;
    }
    const results =
      selectedChangeLog.results && selectedChangeLog.results[page];
    const hasResults = !!(results && results.length);
    let resultsChildren;
    if (hasResults) {
      resultsChildren = (
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
    }
    return (
      <div {...restProps} className={`${className} d-flex flex-column`}>
        <nav
          className="navbar navbar-light bg-light border border-top-0 border-left-0 border-right-0"
          style={{ height: 58 }}
        >
          {Pagination}
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
          {resultsChildren}
        </div>
      </div>
    );
  }
}

const Pagination = (
  <nav className="" aria-label="Page navigation example">
    <ul className="pagination m-0">
      <li className="page-item">
        <a className="page-link" href="#">
          Previous
        </a>
      </li>
      <li className="page-item">
        <a className="page-link" href="#">
          1
        </a>
      </li>
      <li className="page-item">
        <a className="page-link" href="#">
          2
        </a>
      </li>
      <li className="page-item">
        <a className="page-link" href="#">
          3
        </a>
      </li>
      <li className="page-item">
        <a className="page-link" href="#">
          Next
        </a>
      </li>
    </ul>
  </nav>
);
