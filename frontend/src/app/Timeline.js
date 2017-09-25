import React from "react";
import PropTypes from "prop-types";
import invariant from "invariant";
import ProgressBox from "./components/ProgressBox";
import CenterContent from "./components/CenterContent";
import { withContentRect } from "react-measure";
import { select, event } from "d3-selection";
import { scaleTime, scaleLinear } from "d3-scale";
import { axisBottom, axisLeft } from "d3-axis";
import { brushX } from "d3-brush";
import { zoom, zoomIdentity } from "d3-zoom";
import { area, curveMonotoneX } from "d3-shape";
import { extent, max } from "d3-array";
import { toDate, fromDate, randomId } from "./utils";
import { reaction } from "mobx";
import { inject, observer } from "mobx-react";

class TimelineChart extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    measureRef: PropTypes.func,
    measure: PropTypes.func,
    contentRect: PropTypes.object
  };
  constructor(props) {
    super(props);
    this.state = { uid: randomId("timeline-svg") };
  }
  svgRef = ref => (this._svg = select(ref));
  brushed = () => {
    if (event.sourceEvent && event.sourceEvent.type === "zoom") {
      // Ignore brush by zoom
      return;
    }
    const s = event.selection || this._x2.range();
    const domain = s.map(this._x2.invert, this._x2);
    if (event.sourceEvent instanceof MouseEvent) {
      this.props.store.selectedChangeLog.updateQuery({
        from: domain[0],
        to: domain[1]
      });
    }
    this._x.domain(domain);
    this._focus.select(".area").attr("d", this._area);
    this._focus.select(".axis--x").call(this._xAxis);
    this._svg
      .select(".zoom")
      .call(
        this._zoom.transform,
        zoomIdentity.scale(this._width / (s[1] - s[0])).translate(-s[0], 0)
      );
  };
  zoomed = () => {
    if (event.sourceEvent && event.sourceEvent.type === "brush") {
      // Ignore zoom by brush
      return;
    }
    const t = event.transform;
    const domain = t.rescaleX(this._x2).domain();
    if (event.sourceEvent instanceof MouseEvent) {
      this.props.store.selectedChangeLog.updateQuery({
        from: domain[0],
        to: domain[1]
      });
    }
    this._x.domain(domain);
    this._focus.select(".area").attr("d", this._area);
    this._focus.select(".axis--x").call(this._xAxis);
    this._context
      .select(".brush")
      .call(this._brush.move, this._x.range().map(t.invertX, t));
  };
  componentDidMount() {
    this.drawChart();
  }
  componentWillUnmount() {
    this._dispose && this._dispose();
  }
  componentDidUpdate() {
    this.drawChart();
  }
  hasBoundsChanged() {
    if (!this._svg) return false;
    const { contentRect } = this.props;
    const { width, height } = contentRect.bounds;
    return (
      width !== +this._svg.attr("width") || height !== +this._svg.attr("height")
    );
  }
  drawRange(from, to) {
    if (!from) {
      from = this._x2.domain()[0];
    }
    if (!to) {
      to = this._x2.domain()[1];
    }
    const [xFrom, xTo] = this._x.domain();
    if (fromDate(from) != fromDate(xFrom) || fromDate(to) != fromDate(xTo)) {
      const x = this._x2(from),
        y = this._x2(to);
      this._context.select(".brush").call(this._brush.move, [x, y]);
    }
  }
  drawChart(forceRefresh) {
    if (!this._svg) return;
    if (!forceRefresh) {
      forceRefresh = this.hasBoundsChanged();
    }
    if (!forceRefresh) return;
    this._svg.selectAll("*").remove();
    const selectedChangeLog = this.props.store.selectedChangeLog;
    if (
      !selectedChangeLog ||
      !selectedChangeLog.stats ||
      !selectedChangeLog.stats.length
    ) {
      return;
    }
    const data = selectedChangeLog.stats;
    const { bounds } = this.props.contentRect;
    // Don't draw without bounds or too short
    if (!bounds.width || !bounds.height || bounds.height < 100) return;
    // Invalidate measurements, reset previous content and redraw
    const gutter = 20;
    const gutter2 = gutter * 2;
    const spacing = 30;
    const bottomHeight = Math.floor((bounds.height - gutter2 - spacing) / 3);
    const topHeight = bounds.height - gutter2 - spacing - bottomHeight;
    const margin = {
        top: gutter,
        right: gutter,
        bottom: bounds.height - gutter - topHeight,
        left: gutter2
      },
      margin2 = {
        top: gutter + topHeight + spacing,
        right: gutter,
        bottom: gutter2,
        left: gutter2
      },
      width = bounds.width - margin.left - margin.right,
      height = bounds.height - margin.top - margin.bottom,
      height2 = bounds.height - margin2.top - margin2.bottom;
    this._width = width;
    this._svg.attr("width", bounds.width).attr("height", bounds.height);
    // Recalculate all scales
    this._x = scaleTime().range([0, width]);
    this._x2 = scaleTime().range([0, width]);
    this._y = scaleLinear().range([height, 0]);
    this._y2 = scaleLinear().range([height2, 0]);
    this._xAxis = axisBottom(this._x);
    this._xAxis2 = axisBottom(this._x2);
    this._yAxis = axisLeft(this._y);
    this._brush = brushX()
      .extent([[0, 0], [width, height2]])
      .on("brush end", this.brushed);
    this._zoom = zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", this.zoomed);
    this._area = area()
      .curve(curveMonotoneX)
      .x(d => this._x(d.date))
      .y0(height)
      .y1(d => this._y(d.value));
    this._area2 = area()
      .curve(curveMonotoneX)
      .x(d => this._x2(d.date))
      .y0(height2)
      .y1(d => this._y2(d.value));
    this._svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);
    this._focus = this._svg
      .append("g")
      .attr("class", "focus")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    this._context = this._svg
      .append("g")
      .attr("class", "context")
      .attr("transform", `translate(${margin2.left},${margin2.top})`);
    this._x.domain(extent(data, d => d.date));
    this._y.domain([0, max(data, d => d.value)]);
    this._x2.domain(this._x.domain());
    this._y2.domain(this._y.domain());
    // Draw the chart in focus area (top chart)
    this._focus
      .append("path")
      .datum(data)
      .attr("class", "area")
      .attr("style", "fill: steelblue;clip-path: url(#clip);")
      .attr("d", this._area);
    this._focus
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height})`)
      .call(this._xAxis);
    this._focus
      .append("g")
      .attr("class", "axis axis--y")
      .call(this._yAxis);
    // Draw the chart in context (bottom chart)
    this._context
      .append("path")
      .datum(data)
      .attr("class", "area")
      .attr("style", "fill: steelblue;clip-path: url(#clip);")
      .attr("d", this._area2);
    this._context
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height2})`)
      .call(this._xAxis2);
    this._context
      .append("g")
      .attr("class", "brush")
      .call(this._brush)
      .call(this._brush.move, this._x.range());
    this._svg
      .append("rect")
      .attr("class", "zoom")
      .attr("style", "cursor: move;fill: none;pointer-events: all;")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .call(this._zoom);
    if (!this._dispose) {
      // lazy setup, don't listen until svg is setup
      const { store } = this.props;
      invariant(store.selectedChangeLog, "Expects `selectedChangeLog`");
      // Programmatically observe the query, as d3 updates are decoupled
      // from the react component update cycle
      this._dispose = reaction(
        () => [
          store.selectedChangeLog.query.from,
          store.selectedChangeLog.query.to
        ],
        ([from, to]) => {
          this.drawRange(from, to);
        },
        {
          fireImmediately: false,
          delay: 100
        }
      );
    }
  }
  render() {
    // eslint-disable-next-line
    const {
      measureRef,
      measure,
      contentRect,
      store,
      ...restProps
    } = this.props;
    const { uid } = this.state;
    const { width, height } = contentRect.bounds;
    const hasBounds = width && height;
    let layer = hasBounds ? <svg ref={this.svgRef} id={uid} /> : null;
    return (
      <div ref={measureRef} {...restProps}>
        {layer}
      </div>
    );
  }
}

const TimelineMeasurable = withContentRect("bounds")(props => {
  return <TimelineChart {...props} />;
});

@inject(["store"])
@observer
export default class Timeline extends React.Component {
  componentWillMount() {
    this.fetchStatsIfRequired(this.props.store.selectedChangeLog);
  }
  componentWillUpdate(nextProps) {
    this.fetchStatsIfRequired(nextProps.store.selectedChangeLog);
  }
  fetchStatsIfRequired(changelog) {
    if (!changelog) return;
    if (changelog.stats == null) {
      changelog.fetchStats();
    }
  }
  render() {
    const selectedChangeLog = this.props.store.selectedChangeLog;
    if (!selectedChangeLog) {
      return <CenterContent {...this.props} />;
    } else if (selectedChangeLog.stats == null) {
      return <ProgressBox {...this.props} />;
    } else {
      return <TimelineMeasurable {...this.props} />;
    }
  }
}
