import React from "react";

export default class Filters extends React.Component {
  render() {
    // eslint-disable-next-line
    const { className = "", ...restProps } = this.props;
    return (
      <div className={`${className} p-3`} {...restProps}>
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
            {[
              "Product:2",
              "Order:22",
              "Invoice:21",
              "Product:12",
              "Invoice:1"
            ].map(v => {
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
      </div>
    );
  }
}
