import React from "react";
import { inject, observer } from "mobx-react";
import Filters from "./Filters";
import Pages from "./Pages";
import ProgressBox from "../components/ProgressBox";

@inject(["store"])
@observer
export default class Results extends React.Component {
  render() {
    const { className = "", store, ...restProps } = this.props;
    const containerProps = { ...restProps, className: `d-flex ${className}` };
    const selectedChangeLog = store.selectedChangeLog;
    const isProgress =
      !selectedChangeLog || !selectedChangeLog.asyncStatus.ready;
    if (isProgress) {
      return <ProgressBox {...containerProps} />;
    }
    return (
      <div {...containerProps}>
        <Filters
          className="border border-top-0 border-left-0 border-bottom-0"
          style={{ width: 220 }}
        />
        <Pages style={{ flex: 1 }} />
      </div>
    );
  }
}
