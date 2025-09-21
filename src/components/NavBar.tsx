import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop2, Users, GraduationCap, BookOpen, MessageCircle, Users2, Menu, X, Camera, Hand } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/translate', icon: <Camera className="w-5 h-5" />, label: 'Live Translation' },
    
    { path: '/learn', icon: <Hand className="w-5 h-5" />, label: 'Learn Signs' },

    { path: '/team', icon: <Users2 className="w-5 h-5" />, label: 'Team' },
    // { path: '/resources', icon: <BookOpen className="w-5 h-5" />, label: 'Resources' },
    // { path: '/community', icon: <MessageCircle className="w-5 h-5" />, label: 'Community' },

    // ✅ Added new nav items

  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Laptop2 className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sign-Verse
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative group"
              >
                <div className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-64 bg-gray-900 shadow-lg md:hidden"
          >
            <div className="flex flex-col py-4 relative">
              {/* Close Button */}
              <button
                onClick={toggleMenu}
                className="absolute top-4 right-4 text-gray-300 hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
              
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm ${
                    location.pathname === item.path
                      ? 'text-purple-400 bg-purple-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="mobile-indicator"
                      className="absolute left-0 w-1 h-full bg-purple-400"
                      initial={false}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
