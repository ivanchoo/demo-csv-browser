import React from "react";
import Filters from "./Filters";
import Details from "./Details";

export default class Results extends React.Component {
  render() {
    // eslint-disable-next-line
    const { className = "", ...restProps } = this.props;
    return (
      <div {...restProps} className={`d-flex ${className}`}>
        <Filters
          className="border border-top-0 border-left-0 border-bottom-0"
          style={{ width: 220 }}
        />
        <Details style={{ flex: 1 }} />
      </div>
    );
  }
}
