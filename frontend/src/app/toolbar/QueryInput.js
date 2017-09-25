import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { randomId } from "../utils";

@observer
export default class QueryInput extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired
  };
  onChange = evt => {
    // TODO
  };
  constructor(props) {
    super(props);
    this.state = { uid: randomId("input-input-date") };
  }
  render() {
    const { store, ...restProps } = this.props;
    const selected = store.selectedChangeLog;
    if (!selected) return null;
    const { uid } = this.state;
    const label = "From";
    return (
      <div {...restProps}>
        <label htmlFor={uid} className="text-secondary small">
          Query
        </label>
        <input
          type="text"
          className="form-control"
          id={uid}
          placeholder="e.g. 'Product' or 'Order:2'"
          defaultValue=""
        />
      </div>
    );
  }
}
