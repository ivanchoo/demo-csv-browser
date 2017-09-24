import React from "react";

export default class Filters extends React.Component {
  render() {
    const { className = "", ...restProps } = this.props;
    return (
      <div {...restProps} className={`${className} d-flex flex-column bg-light`}>
        <nav className="navbar navbar-light bg-light border border-top-0 border-left-0 border-right-0" style={{ height: 58}}>
          <span className="navbar-text">Events</span>
        </nav>
        <div className="p-3" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <section>
            <h6>Object Types</h6>
            <ul className="list-unstyled">
              {["Product", "Order", "Invoice"].map(v => {
                return (
                  <li key={v}>
                    <a href="#">
                      <span className="badge badge-pill badge-warning">
                        4
                      </span>{" "}
                      {v}
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
          <hr />
          <section>
            <h6>Top Results</h6>
            <ul className="list-unstyled">
              {Array(100)
                .fill()
                .map((v, i) => {
                  return (
                    <li key={i}>
                      <a href="#">
                        <span className="badge badge-pill badge-warning">
                          {i}
                        </span>{" "}
                        Product:{i}
                      </a>
                    </li>
                  );
                })}
            </ul>
          </section>
        </div>
      </div>
    );
  }
}
