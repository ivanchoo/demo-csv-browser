import React from "react";

export default class Filters extends React.Component {
  render() {
    const restProps = this.props;
    return <div {...restProps}>Filters</div>;
  }
}
