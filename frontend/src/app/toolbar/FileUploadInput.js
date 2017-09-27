import React from "react";
import { inject } from "mobx-react";

@inject(["store"])
export default class FileUploadInput extends React.Component {
  onClick = evt => {
    evt.preventDefault();
    this._input.click();
  };
  onChange = evt => {
    evt.preventDefault();
    const file = evt.target.files[0];
    if (file) {
      this.props.store.upload(file);
    }
  };
  render() {
    const {
      children,
      store,
      disabled,
      className = "",
      ...restProps
    } = this.props;

    return (
      <span>
        <input
          type="file"
          ref={ref => (this._input = ref)}
          hidden
          onChange={this.onChange}
        />
        <a
          {...restProps}
          href="#"
          onClick={this.onClick}
          className={`${className} ${disabled ? "disabled" : ""}`}
        >
          {children}
        </a>
      </span>
    );
  }
}
