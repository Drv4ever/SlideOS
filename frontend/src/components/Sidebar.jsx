import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Library, 
  Video, 
  Layout, 
  SlidersHorizontal, 
  Plus, 
  Search, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { getMyPresentations, getPresentationById } from '../services/presentationService';

export function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [recentDecks, setRecentDecks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Load user data
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse user from local storage', e);
    }
  }, []);

  // Fetch recent presentations
  useEffect(() => {
    const fetchDecks = async () => {
      setLoadingDecks(true);
      try {
        const response = await getMyPresentations();
        const decks = response?.data || [];
        // Sort by updatedAt descending and take top 5
        const sorted = [...decks]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 5);
        setRecentDecks(sorted);
      } catch (err) {
        console.error('Failed to load recent decks in sidebar', err);
      } finally {
        setLoadingDecks(false);
      }
    };
    
    // Only fetch if authenticated
    if (localStorage.getItem('token')) {
      fetchDecks();
    }

    // Listen for custom event to refresh sidebar decks
    const handleRefresh = () => fetchDecks();
    window.addEventListener('refresh-sidebar-decks', handleRefresh);
    return () => {
      window.removeEventListener('refresh-sidebar-decks', handleRefresh);
    };
  }, [location.pathname]); // Refetch on route changes to keep sync

  // Keyboard shortcut listener for Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('sidebar-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openPresentation = async (id) => {
    try {
      const response = await getPresentationById(id);
      const record = response?.data;
      const content = record?.content;
      if (!content) return;

      if (Array.isArray(content?.editorSlides)) {
        navigate('/presentation-view', {
          state: {
            editorSlides: content.editorSlides,
            slideNotes: content.slideNotes || [],
            textAmount: content.textAmount || 'detailed',
            presentationId: record?._id || id,
            title: record?.title || 'Untitled Presentation',
            themeId: record?.theme || 'custom',
          },
        });
        return;
      }

      navigate('/preview', {
        state: {
          presentation: content,
          presentationId: record?._id || id,
          title: record?.title || 'Untitled Presentation',
          themeId: record?.theme || 'cornflower',
          textAmount: content?.textAmount || 'detailed',
        },
      });
    } catch (error) {
      console.error('Failed to open presentation from sidebar:', error);
    }
  };

  const handleNewPresentation = () => {
    // Navigate home and clear any state or trigger refetch
    navigate('/');
    // Trigger reset event if needed, or simply let the state clear
    window.dispatchEvent(new CustomEvent('reset-generator-state'));
  };

  // Extract User Initials
  const getUserInitials = () => {
    if (!user) return 'US';
    if (user.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'US';
  };

  const getUsername = () => {
    if (!user) return 'User';
    return user.name || user.email?.split('@')[0] || 'User';
  };

  const handlePresetEngineClick = (presetType) => {
    // Navigate home first
    navigate('/');
    // Dispatch a custom event to notify PresentationGenerator to select this engine preset
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('select-preset-engine', { detail: presetType }));
    }, 50);
  };

  const filteredDecks = recentDecks.filter(deck => 
    deck.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-60 h-full rounded-2xl border border-slate-200 bg-white flex flex-col justify-between p-4 select-none shrink-0 text-slate-600 shadow-md">
      <div className="flex flex-col gap-6 overflow-y-auto pr-1">
        {/* Brand Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 px-2 cursor-pointer py-1.5 bg-transparent border-0 text-left w-full focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:rounded-lg"
          type="button"
        >
          {/* Custom Circle/Pill logo */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center shadow-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <div className="w-8 h-4 rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 opacity-90 shadow-xs" />
          </div>
          <span className="font-semibold text-lg text-slate-800 tracking-tight font-sans">
            SlideOS
          </span>
        </button>

        {/* Action Button: New Deck */}
        <button
          onClick={handleNewPresentation}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-xl border border-slate-200/80 shadow-xs transition-all duration-200 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-slate-500" />
          <span>New Presentation</span>
        </button>

        {/* Search Input */}
        <div className="relative px-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="sidebar-search-input"
            type="text"
            placeholder="Search decks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search presentations"
            className="w-full bg-white border border-slate-200 focus:bg-white text-slate-800 placeholder-slate-400 pl-9 pr-12 py-1.5 rounded-lg text-sm focus:ring-1.5 focus:ring-orange-500/25 outline-none transition-all"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-slate-50 border border-slate-200/60 text-[10px] font-medium text-slate-400 px-1.5 py-0.5 rounded uppercase pointer-events-none font-mono">
            Ctrl K
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-col gap-1 px-1">
          <button
            onClick={() => navigate('/')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              location.pathname === '/' 
                ? 'bg-orange-50/70 text-orange-600 shadow-2xs border border-orange-100/50' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Home className={`w-4 h-4 ${location.pathname === '/' ? 'text-orange-500' : 'text-slate-400'}`} />
            <span>Home</span>
          </button>

          <button
            onClick={() => navigate('/my-presentations')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              location.pathname === '/my-presentations' 
                ? 'bg-orange-50/70 text-orange-600 shadow-2xs border border-orange-100/50' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Library className={`w-4 h-4 ${location.pathname === '/my-presentations' ? 'text-orange-500' : 'text-slate-400'}`} />
            <span>Library</span>
          </button>

          {/* Mode presets replicating KRAFTY sidebar options */}
          <button
            onClick={() => handlePresetEngineClick('cinematic')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-650 hover:bg-slate-100 hover:text-slate-900 transition-all text-left cursor-pointer"
          >
            <Video className="w-4 h-4 text-slate-400" />
            <span>Creative Engine</span>
          </button>

          <button
            onClick={() => handlePresetEngineClick('poster')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-650 hover:bg-slate-100 hover:text-slate-900 transition-all text-left cursor-pointer"
          >
            <Layout className="w-4 h-4 text-slate-400" />
            <span>Outline Planner</span>
          </button>

          <button
            onClick={() => handlePresetEngineClick('realism')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-650 hover:bg-slate-100 hover:text-slate-900 transition-all text-left cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span>Minimalist Studio</span>
          </button>
        </nav>

        {/* Recent Chats / Presentations List */}
        <div className="flex flex-col gap-2 mt-4 px-1">
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3">
            Recent Slide Decks
          </div>
          {loadingDecks ? (
            <div className="px-3 text-xs text-slate-400 py-1">Loading...</div>
          ) : filteredDecks.length === 0 ? (
            <div className="px-3 text-xs text-slate-400/80 italic py-1">
              {searchTerm ? 'No matches found' : 'Saved blueprints coming soon.'}
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filteredDecks.map((deck) => (
                <button
                  key={deck._id}
                  onClick={() => openPresentation(deck._id)}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-650 hover:bg-slate-100 hover:text-slate-900 truncate transition-all cursor-pointer font-medium"
                  title={deck.title}
                >
                  {deck.title || 'Untitled Presentation'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Section at bottom */}
      <div className="flex flex-col gap-2 border-t border-slate-200/80 pt-4 px-1 relative">
        {showLogoutConfirm && (
          <div className="absolute bottom-16 left-2 right-2 bg-white border border-slate-250 shadow-xl rounded-xl p-3 z-50 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="text-xs font-semibold text-slate-700 text-center">Are you sure you want to logout?</span>
            <div className="flex gap-2">
              <button 
                onClick={onLogout}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-1.5 rounded-lg border border-red-200 transition-all cursor-pointer"
              >
                Logout
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
          className="flex items-center justify-between bg-white border border-slate-200/70 p-2.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:border-slate-350 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all w-full text-left bg-transparent border-0 focus-visible:ring-2 focus-visible:ring-orange-500/40"
          type="button"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* User Initials Circle */}
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {getUserInitials()}
            </div>
            
            {/* Details */}
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-slate-800 truncate leading-none mb-1">
                {getUsername()}
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-none truncate">
                SlideOS Workspace
              </span>
            </div>
          </div>

          {/* Badge */}
          <div className="bg-amber-50 border border-amber-200/50 text-[10px] font-bold text-amber-700 px-2 py-0.5 rounded-md flex items-center justify-center shadow-xs">
            $5
          </div>
        </button>
      </div>
    </aside>
  );
}
