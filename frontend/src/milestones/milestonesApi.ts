import { getSession } from "../auth/auth"

function getMilestonesUrl(projectId: string) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiUrl) throw new Error("VITE_API_BASE_URL is missing.");
    return `${apiUrl.replace(/\/$/, "")}/milestones?projectId=${encodeURIComponent(projectId)}`;
}

async function getToken() {
    const token = (await getSession()).tokens?.accessToken?.toString();
    if (!token) throw new Error ("Not signed in.");
    return token;
}

export async function fetchMilestones( { projectId } : { projectId: string} ) {
    const token = await getToken();
    const response = await fetch(getMilestonesUrl(projectId), {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error(`/project/${projectId} return ${response.status}`);

    const data = await response.json();
    return data.milestones;
}

export async function createMilestone({ projectId, name } : { projectId: string, name: string }) {
    const token = await getToken();
    const response = await fetch(getMilestonesUrl(projectId), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error(`/project/${projectId} return ${response.status}`);

    const data = await response.json();
    return data;
}


export async function deleteMilestone({ projectId, milestoneId }: { projectId: string; milestoneId: string }): Promise<void> {
  const token = await getToken();
  const response = await fetch(`${getMilestonesUrl(projectId)}&milestoneId=${encodeURIComponent(milestoneId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error(`/milestones/${milestoneId} returned ${response.status}.`);
}

export async function updateMilestone({ projectId, milestoneId, name }: { projectId: string; milestoneId: string; name: string }) {
  const token = await getToken();
  const response = await fetch(`${getMilestonesUrl(projectId)}&milestoneId=${encodeURIComponent(milestoneId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(`/milestones/${milestoneId} returned ${response.status}.`);

  const data = await response.json();
  return data.milestone;
}
