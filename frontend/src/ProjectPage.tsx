import { useEffect, useState } from "react";
import { fetchMilestones, createMilestone, deleteMilestone, updateMilestone } from "./milestones/milestonesApi";

type Milestone = { projectId: string; milestoneId: string; name: string };

export default function ProjectPage({ project }: { project: { projectId: string; name: string } }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMilestones({ projectId: project.projectId })
      .then((items: Milestone[]) => {
        if (!cancelled) setMilestones(items);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load milestones.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [project.projectId]);

  async function handleUpdate(milestoneId: string, name: string) {
    setError(null);
    try {
      const updated = await updateMilestone({ projectId: project.projectId, milestoneId, name });
      setMilestones((current) => current.map((milestone) => milestone.milestoneId === milestoneId ? updated : milestone));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update milestone.");
    }
  }

  async function handleDelete(milestoneId: string) {
    setError(null);
    try {
      await deleteMilestone({ projectId: project.projectId, milestoneId });
      setMilestones((current) => current.filter((milestone) => milestone.milestoneId !== milestoneId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete milestone.");
    }
  }

  return (
    <div className="project-page">
      <h1>{project.name}</h1>
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && milestones.length === 0 && <p>No milestones yet.</p>}
      <form className="create-milestone" onSubmit={async (event) => {
        event.preventDefault();
        if (loading || creating) return;
        setCreating(true);
        setError(null);
        try {
          const newMilestone = await createMilestone({ projectId: project.projectId, name: newMilestoneName.trim() });
          setMilestones((current) => current.concat(newMilestone));
          setNewMilestoneName("");
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Could not create milestone.");
        } finally {
          setCreating(false);
        }
      }}>
        <label htmlFor="new-milestone-name">New milestone</label>
        <input
          id="new-milestone-name"
          value={newMilestoneName}
          onChange={(event) => setNewMilestoneName(event.target.value)}
        />
        <button type="submit" disabled={loading || creating}>Create milestone</button>
      </form>
      
      <ul>
        {milestones.map((milestone) => (
          <li key={milestone.milestoneId}>
            {editingId === milestone.milestoneId ? (
              <form onSubmit={async (event) => {
                event.preventDefault();
                const name = draft.trim();
                await handleUpdate(milestone.milestoneId, name);
                setEditingId(null);
              }}>
                <input aria-label="Milestone name" value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus />
                <button type="submit" disabled={!draft.trim() || draft.trim() === milestone.name}>Save</button>
                <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                {milestone.name}
                <button type="button" onClick={() => {
                  setDraft(milestone.name);
                  setEditingId(milestone.milestoneId);
                }}>Edit</button>
              </>
            )}
            <button type="button" onClick={() => void handleDelete(milestone.milestoneId)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}