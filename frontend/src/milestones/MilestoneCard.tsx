import { useRef, useState } from "react";

export default function MilestoneCard({ name, onUpdate, onDelete } : { name: string, onUpdate: (name: string) => void, onDelete: () => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(name);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpdate = () => {
        onUpdate(newName);
        setIsEditing(false);
    };

    return (
        <div>
            {isEditing ? (
                <input
                    ref={inputRef}
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
                <span onClick={() => setIsEditing(true)}>{name}</span>
            )}
            <button onClick={onDelete}>Delete</button>
        </div>
    );
}