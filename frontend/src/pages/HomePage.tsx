import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Sparkles, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useProjects } from '../hooks/useProjects';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';

export const HomePage: React.FC = () => {
  const { projects, loading } = useProjects();
  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center space-y-8">
            {/* CORRECTED TEXT */}
            <h1 className="text-5xl lg:text-7xl font-bold font-playfair text-white leading-tight">
              Showcase Your Work.
              <span className="block text-gray-400">Control Your Code.</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              A central hub for your academic projects. Build a clean, professional portfolio and share your source code securely, on your terms.
            </p>
            {/* END CORRECTION */}

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link to="/projects">
                <Button size="lg" className="group">
                  Explore Projects
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">
                  Add Your Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-white mb-4">
            Why Choose ProjectNinjas?
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Built exclusively for students who demand excellence in presentation and security
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card hover className="p-8 text-center space-y-4">
            <Shield className="w-12 h-12 text-white mx-auto" />
            <h3 className="text-xl font-semibold font-playfair text-white">
              Secure Access Control
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Your intellectual property is protected. Grant access only to those you trust 
              through our sophisticated request system.
            </p>
          </Card>

          <Card hover className="p-8 text-center space-y-4">
            <Sparkles className="w-12 h-12 text-white mx-auto" />
            <h3 className="text-xl font-semibold font-playfair text-white">
              Premium Presentation
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Elevate your work with our minimalist, luxury design. Every project 
              showcased with the sophistication it deserves.
            </p>
          </Card>

          <Card hover className="p-8 text-center space-y-4">
            <Users className="w-12 h-12 text-white mx-auto" />
            <h3 className="text-xl font-semibold font-playfair text-white">
              Academic Network
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Connect with fellow students, researchers, and faculty. Build meaningful 
              academic relationships through shared excellence.
            </p>
          </Card>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-white mb-4">
            Featured Excellence
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Discover outstanding projects from our community of academic innovators
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <Card key={index} className="p-6 space-y-4">
                <SkeletonLoader className="h-6" />
                <SkeletonLoader lines={3} />
                <div className="flex flex-wrap gap-2">
                  <SkeletonLoader className="h-6 w-16" />
                  <SkeletonLoader className="h-6 w-20" />
                  <SkeletonLoader className="h-6 w-12" />
                </div>
              </Card>
            ))
          ) : (
            featuredProjects.map((project) => (
              <Card key={project.projectId} hover className="p-6 space-y-4">
                <h3 className="text-lg font-semibold font-playfair text-white leading-tight">
                  {project.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                  {project.abstract}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.keywords.slice(0, 3).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md"
                    >
                      {keyword}
                    </span>
                  ))}
                  {project.keywords.length > 3 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{project.keywords.length - 3} more
                    </span>
                  )}
                </div>
                <Link to={`/projects/${project.projectId}`}>
                  <Button variant="outline" size="sm" className="w-full group">
                    View Project
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </Card>
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <Link to="/projects">
            <Button variant="outline" size="lg">
              View All Projects
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};