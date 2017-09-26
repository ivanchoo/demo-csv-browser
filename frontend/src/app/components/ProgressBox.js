import React from "react";
import CenterContent from "./CenterContent";
import Spinner from "./Spinner";

export default class ProgressBox extends React.Component {
  render() {
    return (
      <CenterContent {...this.props}>
        <Spinner visible={true} />
      </CenterContent>
    );
  }
}
