export default function ProjectCard({ name }: { name: string }) {
  return (
    <div className="project-card">
      <h3>{name}</h3>
    </div>
  );
}
