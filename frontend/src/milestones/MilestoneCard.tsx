import { useState } from "react";

export default function MilestoneCard({ name, onUpdate, onDelete }: {
  name: string;
  onUpdate: (name: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  return (
    <div className="milestone-card">
      {editing ? (
        <form onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) return;
          onUpdate(draft.trim());
          setEditing(false);
        }}>
          <input aria-label="Milestone name" value={draft} onChange={(event) => setDraft(event.target.value)} autoFocus required maxLength={200} />
          <button type="submit" disabled={!draft.trim() || draft.trim() === name}>Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <span className="item-name">{name}</span>
          <button type="button" onClick={() => {
            setDraft(name);
            setEditing(true);
          }}>Edit</button>
          <button className="danger" type="button" onClick={onDelete}>Delete</button>
        </>
      )}
    </div>
  );
}
