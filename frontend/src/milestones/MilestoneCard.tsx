import { useState } from "react";

export default function MilestoneCard({
  name,
  onUpdate,
  onDelete,
}: {
  name: string;
  onUpdate: (name: string) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);

  const handleUpdate = () => {
    onUpdate(newName.trim());
    setIsEditing(false);
  };

  return (
    <div className="milestone-card">
      {isEditing ? (
        <input
          aria-label="Milestone name"
          autoFocus
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onBlur={handleUpdate}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleUpdate();
          }}
        />
      ) : (
        <span
          onClick={() => {
            setNewName(name);
            setIsEditing(true);
          }}
        >
          {name}
        </span>
      )}
      <button type="button" onClick={onDelete}>
        Delete
      </button>
    </div>
  );
}
