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
