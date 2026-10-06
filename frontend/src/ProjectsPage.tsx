import { useEffect, useState } from "react";
import ProjectCard from "./projects/ProjectCard";
import { listProjects, createProject } from "./projects/projectsApi";

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

  return (
    <div className="projects-page">
      <h1>Projects</h1>
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      <div className="projects-list">
        {!loading && projects.length === 0 && <p>No projects yet.</p>}
        {projects.map((project) => (
          <ProjectCard key={project.projectId} name={project.name} />
        ))}
      </div>
      <form className="create-project" onSubmit={async (event) => {
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
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
        />
        <button type="submit" disabled={!projectName.trim() || creating}>Create project</button>
      </form>
    </div>
  );
}
