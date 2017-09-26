import React from "react";
import PropTypes from "prop-types";

export default class Spinner extends React.Component {
  static propTypes = {
    visible: PropTypes.bool
  };
  render() {
    const { className = "", visible = false, ...restProps } = this.props;
    if (!visible) return null;
    return (
      <div
        {...restProps}
        className={`${className} spinner d-flex align-items-center`}
      >
        <div className="bounce1" />
        <div className="bounce2" />
        <div className="bounce3" />
      </div>
    );
  }
}
