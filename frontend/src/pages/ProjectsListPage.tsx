import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Calendar, User } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { useProjects } from '../hooks/useProjects';

const INITIAL_PROJECTS_TO_SHOW = 6;
const INITIAL_KEYWORDS_TO_SHOW = 7;
const PROJECTS_TO_LOAD_MORE = 6;
const KEYWORDS_TO_LOAD_MORE = 7;

export const ProjectsListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState('');
  // --- THIS IS THE FIX: State for "Show More" ---
  const [visibleProjects, setVisibleProjects] = useState(INITIAL_PROJECTS_TO_SHOW);
  const [visibleKeywords, setVisibleKeywords] = useState(INITIAL_KEYWORDS_TO_SHOW);

  const { projects, loading } = useProjects();

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.abstract.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedKeyword) {
      filtered = filtered.filter(project =>
        project.keywords.includes(selectedKeyword)
      );
    }
    return filtered;
  }, [projects, searchQuery, selectedKeyword]);

  const allKeywords = useMemo(() => {
    const keywords = new Set<string>();
    projects.forEach(project => {
      project.keywords.forEach(keyword => keywords.add(keyword));
    });
    return Array.from(keywords).sort();
  }, [projects]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold font-playfair text-white">
          Explore Projects
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Discover outstanding academic projects from talented students.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-4 text-center bg-gray-900/50 border border-gray-700"
          />
        </div>

        {/* --- MODIFIED: Keyword Filter with "Show More" --- */}
        {allKeywords.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-2 max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedKeyword('')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedKeyword === '' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {allKeywords.slice(0, visibleKeywords).map((keyword) => (
              <button
                key={keyword}
                onClick={() => setSelectedKeyword(keyword)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedKeyword === keyword ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {keyword}
              </button>
            ))}
            {allKeywords.length > visibleKeywords && (
              <button
                onClick={() => setVisibleKeywords(prev => prev + KEYWORDS_TO_LOAD_MORE)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                More...
              </button>
            )}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array(6).fill(0).map((_, index) => (
            <Card key={index} className="p-6 space-y-4"><SkeletonLoader lines={5} /></Card>
          ))
        ) : (
          // --- MODIFIED: Show only a slice of the projects ---
          filteredProjects.slice(0, visibleProjects).map((project) => (
            <Card key={project.projectId} hover className="p-6 space-y-4">
              <h3 className="text-lg font-semibold font-playfair text-white">{project.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-4">{project.abstract}</p>
              <div className="flex flex-wrap gap-1">
                {project.keywords.slice(0, 4).map((keyword) => (
                  <span key={keyword} className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md">{keyword}</span>
                ))}
              </div>
              <Link to={`/projects/${project.projectId}`}>
                <Button variant="outline" size="sm" className="w-full group">
                  View Details
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1" />
                </Button>
              </Link>
            </Card>
          ))
        )}
      </div>

      {/* --- NEW: "Show More" Button for Projects --- */}
      {!loading && filteredProjects.length > visibleProjects && (
        <div className="text-center pt-8">
          <Button
            variant="secondary"
            onClick={() => setVisibleProjects(prev => prev + PROJECTS_TO_LOAD_MORE)}
          >
            Show More Projects
          </Button>
        </div>
      )}
    </div>
  );
};