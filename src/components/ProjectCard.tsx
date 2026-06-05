import { GlowCard } from "./ui/spotlight-card";
import { Button } from "./ui/button";

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category?: string;
  designerId?: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <GlowCard
      customSize={true}
      glowColor="blue"
      className="p-0 rounded-none bg-neutral-950/40 border border-neutral-900 hover:border-neutral-750 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
    >
      {/* Project Image */}
      <div className="relative aspect-video overflow-hidden bg-neutral-900 border-b border-neutral-900 z-20">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        {project.category && (
          <span className="absolute top-2.5 right-2.5 z-30 text-[9px] uppercase font-bold tracking-widest text-white bg-black/80 border border-neutral-800 px-2 py-0.5 rounded-none">
            {project.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 relative z-20 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text transition-all duration-300">
            {project.title}
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
            {project.description}
          </p>
        </div>

        {onDelete && (
          <Button
            onClick={() => onDelete(project.id)}
            variant="destructive"
            size="sm"
            className="w-full text-[10px] h-8 rounded-none py-0 font-semibold"
          >
            Delete Project
          </Button>
        )}
      </div>
    </GlowCard>
  );
}
