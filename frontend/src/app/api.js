const jsonHeaders = {
  "content-type": "application/json"
};

const endpoint = "/api";

export const fetchChangeLogs = () => {
  return fetch(`${endpoint}/changelogs`, {
    method: "GET",
    headers: jsonHeaders
  }).then(response => {
    return response.json();
  });
};
