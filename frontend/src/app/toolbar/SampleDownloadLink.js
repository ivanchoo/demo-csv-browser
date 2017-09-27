import React from "react";
import { downloadSampleEndpoint } from "../api";

export default class SampleDownloadLink extends React.Component {
  render() {
    const { children, className='', disabled, ...restProps } = this.props;
    return (
      <a
        {...restProps}
        href={downloadSampleEndpoint}
        className={`${className} ${disabled ? "disabled" : ""}`}
      >
        {children}
      </a>
    );
  }
}
