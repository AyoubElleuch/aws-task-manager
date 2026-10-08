import { useState } from "react";

export default function TaskCard({
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
    onUpdate(newName);
    setIsEditing(false);
  };

  return (
    <div className="task-card">
      {isEditing ? (
        <input
          aria-label="Task name"
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleUpdate();
            }
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
