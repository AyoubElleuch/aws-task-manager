import { useRef, useState } from "react";
import { Link } from "react-router";

export default function ProjectCard({ projectId, name, onUpdate, onDelete }: { projectId: string; name: string; onUpdate: (name: string) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const deleteDialog = useRef<HTMLDialogElement>(null);

  return (
    <div className="project-card">
      {editing ? (
        <form onSubmit={(event) => {
          event.preventDefault();
          onUpdate(draft.trim());
          setEditing(false);
        }}>
          <input aria-label="Project name" value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus />
          <button type="submit" disabled={!draft.trim() || draft.trim() === name}>Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <p className="eyebrow">Project</p>
          <h3><Link to={`/projects/${encodeURIComponent(projectId)}`}>{name}</Link></h3>
          <button type="button" onClick={() => {
            setDraft(name);
            setEditing(true);
          }}>Edit</button>
        </>
      )}
      <button type="button" className="danger" onClick={() => deleteDialog.current?.showModal()}>Delete</button>
      <dialog ref={deleteDialog} aria-label={`Delete ${name}`}>
        <p>Are you sure you want to delete "{name}"?</p>
        <button type="button" onClick={() => deleteDialog.current?.close()}>Cancel</button>
        <button type="button" onClick={() => {
          deleteDialog.current?.close();
          onDelete();
        }}>Delete project</button>
      </dialog>
    </div>
  );
}
