import { timeParse } from "d3-time-format";

export const parseDate = timeParse("%Y-%m-%d");

export const positionGreedy = props => {
  return {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    ...props
  };
};
