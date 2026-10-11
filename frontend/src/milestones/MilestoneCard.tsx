import { useState } from "react";

export default function MilestoneCard({ name, completed, onUpdate, onDelete }: {
  name: string;
  completed: boolean;
  onUpdate: (name: string, completed: boolean) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  return (
    <>
      <summary>
        <span className="item-name">{name}</span>
        <input type="checkbox" checked={completed} onChange={(event) => onUpdate(name, event.target.checked)} />
        {!editing && (
          <span className="milestone-actions">
            <button type="button" onClick={(event) => {
              event.preventDefault();
              event.currentTarget.closest("details")?.setAttribute("open", "");
              setDraft(name);
              setEditing(true);
            }}>Edit</button>
            <button className="danger" type="button" onClick={(event) => {
              event.preventDefault();
              onDelete();
            }}>Delete</button>
          </span>
        )}
      </summary>
      {editing && <div className="milestone-card">
        <form onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          onUpdate(draft.trim(), completed);
          setEditing(false);
        }}>
          <input aria-label="Milestone name" value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus required maxLength={200} />
          <button type="submit" disabled={!draft.trim() || draft.trim() === name}>Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      </div>}
    </>
  );
}
