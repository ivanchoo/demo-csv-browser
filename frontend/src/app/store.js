import { observable, action, useStrict, computed, runInAction } from "mobx";
import { fetchChangeLogs } from "./api";
import invariant from "invariant";

useStrict(true);

export class Query {
  @observable from = null;

  @observable to = null;

  @observable query: null;

  @computed
  get fromDate() {
    return this.startTime !== 0;
  }
}

export class ChangeLog {
  id = null;

  filename = null;

  @observable queried = null;

  @observable queriedStats = null;

  @observable query = null;

  constructor() {
    this.query = new Query();
  }

  @action.bound
  updateQuery(next) {
    Object.keys(next).forEach(key => {
      const value = next[key];
      switch (key) {
        case "from":
        case "to":
          invariant(
            value === null || value instanceof Date,
            "Expects Date or `null`"
          );
          return this.query[key] = value;
        case "query":
          invariant(
            value === null || value instanceof String,
            "Expects String or `null`"
          )
          this.query.query = !!value ? null : value;
          break;
        default:
          throw new Error(`Unsupported query ${key}`);
      }
    });
  }
}

export class Store {
  @observable changeLogs = [];

  @observable status = "init";

  @observable selectedChangeLog = null;

  @action.bound
  select(changeLog) {
    invariant(changeLog instanceof ChangeLog, "Expects ChangeLog type");
    this.selectedChangeLog = changeLog;
  }

  @action.bound
  fetch() {
    this.status = "pending";
    return fetchChangeLogs().then(
      resp => {
        runInAction(() => {
          this.changeLogs = resp.map(data => {
            const cl = new ChangeLog();
            cl.id = data["changelog_id"];
            cl.filename = data["filename"];
            return cl;
          });
          this.status = "success";
          // TODO: remove auto select
          this.selectedChangeLog = this.changeLogs[0];
        });
        return resp;
      },
      () => {
        runInAction(() => {
          this.status = "error";
        });
      }
    );
  }
}
