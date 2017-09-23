import React from "react";

export default class Details extends React.Component {
  render() {
    // eslint-disable-next-line
    const { className = "", ...restProps } = this.props;
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
          <table className="table">
            <tbody>
              {Array(100)
                .fill()
                .map((_, i) => {
                  return (
                    <tr key={i}>
                      <td style={{ width: "25%" }}>
                        <a href="#">Product:{i}</a>
                      </td>
                      <td style={{ width: "25%" }}>17 December, 2017</td>
                      <td className="h5">
                        <span className="badge badge-pill badge-light">
                          Primary:Secondary
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
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
