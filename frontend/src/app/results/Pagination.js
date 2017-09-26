import React from "react";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { noop } from "../utils";

const PAD = 2;

const PageItem = ({ label, value, onClick, active, disabled, style }) => {
  return (
    <li
      style={style}
      className={`page-item ${active ? "active" : ""} ${disabled
        ? "disabled"
        : ""}`}
    >
      <a
        className="page-link text-center"
        data-value={value}
        href="#"
        onClick={onClick}
      >
        {label || value}
      </a>
    </li>
  );
};

export default class Pagination extends React.Component {
  static propTypes: {
    pages: PropTypes.number.isRequired,
    current: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
    goto: PropTypes.func
  };
  onClick = evt => {
    const { pages, current, goto = noop } = this.props;
    const value = evt.target.dataset["value"];
    let next;
    switch (value) {
      case "previous":
        next = Math.max(1, current - 1);
        break;
      case "start":
        next = 1;
        break;
      case "end":
        next = pages;
        break;
      case "next":
        next = Math.min(pages, current + 1);
        break;
      default:
        next = parseInt(value);
    }
    if (isNaN(next)) {
      return;
    }
    goto(next);
  };
  render() {
    const { pages, current, goto, disabled = false, ...restProps } = this.props;
    if (pages <= 1) {
      return null;
    }
    const itemStyle = { minWidth: 48 };
    const stepperStyle = { minWidth: 65 };
    const ffStyle = { minWidth: 45 };
    const items = [];
    const wantsFF = pages > 1 + PAD * 2; // Fast-forward
    let start = Math.max(current - PAD, 1);
    const end = Math.min(start + PAD * 2, pages);
    if (end - start < 1 + PAD * 2) {
      start = Math.max(end - PAD * 2, 1);
    }
    for (var i = start; i <= end; i++) {
      items.push(
        <PageItem
          onClick={this.onClick}
          key={i}
          value={i}
          style={itemStyle}
          active={i === current}
          disabled={disabled}
        />
      );
    }
    if (wantsFF) {
      items.unshift(
        <PageItem
          onClick={this.onClick}
          label="&laquo;"
          key="start"
          value="start"
          style={ffStyle}
          disabled={disabled || start == 1}
        />
      );
      items.push(
        <PageItem
          onClick={this.onClick}
          label="&raquo;"
          key="end"
          value="end"
          style={ffStyle}
          disabled={disabled || end == pages}
        />
      );
    }
    items.unshift(
      <PageItem
        onClick={this.onClick}
        label="Prev"
        key="previous"
        value="previous"
        style={stepperStyle}
        disabled={disabled || current == 1}
      />
    );
    items.push(
      <PageItem
        onClick={this.onClick}
        label="Next"
        key="next"
        value="next"
        style={stepperStyle}
        disabled={disabled || current == pages}
      />
    );
    return (
      <nav {...restProps} aria-label="Results Navigation">
        <ul className="pagination m-0">{items}</ul>
      </nav>
    );
  }
}
