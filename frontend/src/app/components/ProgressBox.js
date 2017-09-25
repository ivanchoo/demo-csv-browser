import React from "react";
import CenterContent from "./CenterContent";

export default class ProgressBox extends React.Component {
  render() {
    return (
      <CenterContent {...this.props}>
        <small className="text-secondary">Loading..</small>
      </CenterContent>
    );
  }
}
