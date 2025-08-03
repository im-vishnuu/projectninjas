import React from 'react';
import { BookOpen, Github, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-white" />
              <span className="text-xl font-bold font-playfair text-white">ProjectNinjas</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Showcasing academic excellence through secure and elegant project portfolios. 
              Where student innovation meets professional presentation.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold font-playfair">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Explore Projects
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Create Portfolio
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Access Requests
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Security & Privacy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold font-playfair">Connect</h3>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              Built for students, by students. <br />
              Elevating academic portfolios to professional standards.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 ProjectNinjas. All rights reserved. | Protected Prestige™
          </p>
        </div>
      </div>
    </footer>
  );
};