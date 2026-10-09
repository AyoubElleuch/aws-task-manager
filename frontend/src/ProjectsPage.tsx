import { useEffect, useState } from "react";
import ProjectCard from "./projects/ProjectCard";
import { listProjects, createProject, updateProject, deleteProject } from "./projects/projectsApi";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<{ projectId: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const projects = await listProjects();
        setProjects(projects);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load projects.");
      } finally {
        setLoading(false);
      }
    }
    void fetchProjects();
  }, []);

  async function handleDelete(projectId: string) {
    setError(null);
    try {
      await deleteProject(projectId);
      setProjects((current) => current.filter((project) => project.projectId !== projectId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete project.");
    }
  }

  async function handleUpdate(projectId: string, name: string) {
    setError(null);
    try {
      const updatedProject = await updateProject(projectId, name);
      setProjects((current) => current.map((project) => project.projectId === projectId ? updatedProject : project));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update project.");
    }
  }

  return (
    <div className="projects-page">
      <h1>Projects</h1>
      <p className="muted">Keep your work clear, one project at a time.</p>
      <div className="stats" aria-label="Project statistics">
        <span className="eyebrow">Total projects</span>
        <strong>{loading || error ? "—" : projects.length}</strong>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      <div className="projects-list">
        {!loading && !error && projects.length === 0 && (
          <div className="empty-state">
            <h2>No projects yet.</h2>
            <p className="muted">Create your first project below to get started.</p>
          </div>
        )}
        {projects.map((project) => (
          <ProjectCard
            key={project.projectId}
            projectId={project.projectId}
            name={project.name}
            onDelete={() => handleDelete(project.projectId)}
            onUpdate={(name) => handleUpdate(project.projectId, name)}
          />
        ))}
      </div>
      <form className="create-project create-form" onSubmit={async (event) => {
        event.preventDefault();
        setCreating(true);
        setError(null);
        try {
          const newProject = await createProject(projectName.trim());
          setProjects((current) => current.concat(newProject));
          setProjectName("");
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Could not create project.");
        } finally {
          setCreating(false);
        }
      }}>
        <label htmlFor="new-project-name">New project</label>
        <input
          id="new-project-name"
          placeholder="e.g. Website launch"
          maxLength={200}
          required
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
        />
        <button type="submit" disabled={!projectName.trim() || creating}>{creating ? "Creating…" : "Create project"}</button>
      </form>
    </div>
  );
}
