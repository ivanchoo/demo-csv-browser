const endpoint = "/api";
const jsonHeaders = {
  "content-type": "application/json"
};

const jsonGET = endpoint => {
  return fetch(endpoint, {
    method: "GET",
    headers: jsonHeaders
  }).then(response => {
    return response.json();
  });
}

export const fetchChangeLogs = () => {
  return jsonGET(`${endpoint}/changelogs`);
};


export const fetchChangeLogStats = id => {
  return jsonGET(`${endpoint}/changelog/${id}/stats`);
};
