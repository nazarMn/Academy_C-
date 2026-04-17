import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Boxes, Rocket, ArrowRight, CheckCircle, ExternalLink, Play, Loader2
} from 'lucide-react';
import { Card, Badge, Button, ProgressBar } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import useAppStore from '@/stores/useAppStore';
import { LEVEL_COLORS } from '@/lib/constants';

export default function Projects() {
  const { startedProjects, startProject, activeCourse } = useAppStore();
  const toast = useToast();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch(`/api/projects?courseId=${activeCourse}`);
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [activeCourse]);

  const handleStart = (project) => {
    startProject(project.id);
    navigate(`/build/${project.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-50">Проєкти</h1>
        <p className="text-sm text-surface-400 mt-1">
          Застосуйте знання для створення реальних додатків
        </p>
      </div>

      {/* Progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-surface-200">Розпочато проєктів</span>
          <span className="text-sm font-mono text-accent">
            {startedProjects.length}/{projects.length}
          </span>
        </div>
        <ProgressBar
          value={projects.length ? Math.round((startedProjects.length / projects.length) * 100) : 0}
          size="lg"
          color="warning"
        />
      </Card>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {projects.map(project => {
          const started = startedProjects.includes(project.id);
          const colors = LEVEL_COLORS[project.level] || LEVEL_COLORS.beginner;
          const displayTags = project.tags || [];

          return (
            <Card key={project.id} hover className="flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center text-xl`}>
                  {project.icon || <Boxes size={20} className={colors.text} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-surface-100 truncate">
                    {project.title}
                  </h3>
                  <Badge.Level level={project.level} />
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-surface-400 leading-relaxed mb-4 flex-1">
                {project.description}
              </p>

              {/* Tags */}
              {displayTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {displayTags.slice(0, 5).map(tag => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-surface-800 text-surface-400 border border-surface-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-surface-700/50">
                <Badge color="accent" size="sm">+{project.xp} XP</Badge>
                {started ? (
                  <Link to={`/build/${project.id}`} className="flex items-center gap-1.5 text-success text-xs font-medium hover:underline">
                    <Play size={14} />
                    Продовжити
                  </Link>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStart(project)}
                  >
                    Розпочати
                    <ArrowRight size={14} />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {projects.length === 0 && !loading && (
        <p className="text-surface-500 text-center py-8">Проєктів поки немає.</p>
      )}
    </div>
  );
}
