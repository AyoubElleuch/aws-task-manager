import { getSession } from "../auth/auth";

function getProjectsUrl() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiUrl) throw new Error("VITE_API_BASE_URL is missing.");
  return `${apiUrl}/projects`;
}

async function getToken() {
  const token = (await getSession()).tokens?.accessToken?.toString();
  if (!token) throw new Error("Not signed in.");
  return token;
}

export async function listProjects() {
  const token = await getToken();
  const response = await fetch(getProjectsUrl(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`/projects returned ${response.status}.`);

  const data = await response.json();
  return data.projects;
}

export async function getProject(projectId: string) {
  const token = await getToken();
  const url = `${getProjectsUrl()}?projectId=${encodeURIComponent(projectId)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`/projects returned ${response.status}.`);

  const data = await response.json();
  return data.project;
}

export async function createProject(name: string) {
  const token = await getToken();
  const response = await fetch(getProjectsUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(`/projects returned ${response.status}.`);

  return response.json();
}

export async function updateProject(projectId: string, name: string) {
  const token = await getToken();
  const url = `${getProjectsUrl()}?projectId=${encodeURIComponent(projectId)}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(`/projects returned ${response.status}.`);

  const data = await response.json();
  return data.project;
}

export async function deleteProject(projectId: string) {
  const token = await getToken();
  const url = `${getProjectsUrl()}?projectId=${encodeURIComponent(projectId)}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(`/projects returned ${response.status}.`);

  return response.json();
}
