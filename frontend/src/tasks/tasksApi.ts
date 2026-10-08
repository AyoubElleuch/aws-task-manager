import { getToken } from "../auth/getToken";

function getTasksUrl(projectId: string, milestoneId: string) {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiUrl) throw new Error("VITE_API_BASE_URL is missing");
  return `${apiUrl}/tasks?projectId=${projectId}&milestoneId=${milestoneId}`;
}

export async function fetchTasks({ projectId, milestoneId }: { projectId: string; milestoneId: string }) {
  const token = await getToken();
  const response = await fetch(getTasksUrl(projectId, milestoneId), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.statusText}`);

  const data = await response.json();
  return data.tasks;
}

export async function createTask({ projectId, milestoneId, name }: { projectId: string; milestoneId: string; name: string }) {
    const token = await getToken();
    const response = await fetch(getTasksUrl(projectId, milestoneId), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error(`Failed to create task: ${response.statusText}`);

    const data = await response.json();
    return data;
}

export async function deleteTask({ projectId, milestoneId, taskId }: { projectId: string; milestoneId: string; taskId: string }): Promise<void> {
    const token = await getToken();
    const response = await fetch(`${getTasksUrl(projectId, milestoneId)}&taskId=${taskId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error(`Failed to delete task: ${response.statusText}`);

}

export async function updateTask({ projectId, milestoneId, taskId, name }: { projectId: string; milestoneId: string; taskId: string; name: string }) {
    const token = await getToken();
    const response = await fetch(`${getTasksUrl(projectId, milestoneId)}&taskId=${taskId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error(`Failed to update task: ${response.statusText}`);

    const data = await response.json();
    return data.task;
}