import React from "react";

export default class CenterContent extends React.Component {
  render() {
    const { className = "", children, style } = this.props;
    return (
      <div
        className={`${className} d-flex align-items-center justify-content-center`}
        style={style}
      >
        {children}
      </div>
    );
  }
}
