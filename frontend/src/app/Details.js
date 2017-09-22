import React from "react";

export default class Details extends React.Component {
  render() {
    const restProps = this.props;
    return <div {...restProps}>Details</div>;
  }
}
