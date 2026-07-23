import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  Library,
  Video,
  Layout,
  SlidersHorizontal,
  Plus,
  LogOut,
} from 'lucide-react'
import { getMyPresentations, getPresentationById } from '../services/presentationService'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInput,
  SidebarSeparator,
} from './ui/sidebar'
import { Button } from './ui/button'

export function AppSidebar({ onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [recentDecks, setRecentDecks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingDecks, setLoadingDecks] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
    } catch (e) {
      console.error('Failed to parse user from local storage', e)
    }
  }, [])

  useEffect(() => {
    const fetchDecks = async () => {
      setLoadingDecks(true)
      try {
        const response = await getMyPresentations()
        const decks = response?.data || []
        const sorted = [...decks]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 5)
        setRecentDecks(sorted)
      } catch (err) {
        console.error('Failed to load recent decks in sidebar', err)
      } finally {
        setLoadingDecks(false)
      }
    }

    if (localStorage.getItem('token')) {
      fetchDecks()
    }

    const handleRefresh = () => fetchDecks()
    window.addEventListener('refresh-sidebar-decks', handleRefresh)
    return () => window.removeEventListener('refresh-sidebar-decks', handleRefresh)
  }, [location.pathname])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('sidebar-search-input')
        if (searchInput) searchInput.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const openPresentation = async (id) => {
    try {
      const response = await getPresentationById(id)
      const record = response?.data
      const content = record?.content
      if (!content) return

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
        })
        return
      }

      navigate('/preview', {
        state: {
          presentation: content,
          presentationId: record?._id || id,
          title: record?.title || 'Untitled Presentation',
          themeId: record?.theme || 'cornflower',
          textAmount: content?.textAmount || 'detailed',
        },
      })
    } catch (error) {
      console.error('Failed to open presentation from sidebar:', error)
    }
  }

  const handleNewPresentation = () => {
    navigate('/')
    window.dispatchEvent(new CustomEvent('reset-generator-state'))
  }

  const getUserInitials = () => {
    if (!user) return 'US'
    if (user.name) {
      const parts = user.name.split(' ')
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return user.name.slice(0, 2).toUpperCase()
    }
    if (user.email) return user.email.slice(0, 2).toUpperCase()
    return 'US'
  }

  const getUsername = () => {
    if (!user) return 'User'
    return user.name || user.email?.split('@')[0] || 'User'
  }

  const handlePresetEngineClick = (presetType) => {
    navigate('/')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('select-preset-engine', { detail: presetType }))
    }, 50)
  }

  const filteredDecks = recentDecks.filter(deck =>
    deck.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarContent>
        {/* Logo + New Presentation (visible when expanded) */}
        <div className="flex flex-col gap-2 p-3 pb-0 group-data-[collapsible=icon]:hidden">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer py-1.5"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center shadow-xs shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </div>
              <div className="w-8 h-4 rounded-full bg-gradient-to-r from-orange-500 to-cyan-400 opacity-90 shadow-xs" />
            </div>
            <span className="font-semibold text-lg text-sidebar-foreground tracking-tight">
              SlideOS
            </span>
          </div>
          <Button
            onClick={handleNewPresentation}
            variant="destructive"
            size="sm"
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Presentation</span>
          </Button>
        </div>

        {/* Logo only for collapsed state */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center py-3">
          <div
            onClick={() => navigate('/')}
            className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center shadow-xs cursor-pointer"
          >
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
        </div>

        {/* Search */}
        <div className="px-2 group-data-[collapsible=icon]:hidden">
          <SidebarInput
            placeholder="Search decks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="sidebar-search-input"
          />
        </div>

        <SidebarSeparator />

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname === '/'}
                  onClick={() => navigate('/')}
                  tooltip="Home"
                >
                  <Home />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname === '/my-presentations'}
                  onClick={() => navigate('/my-presentations')}
                  tooltip="Library"
                >
                  <Library />
                  <span>Library</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Preset Engines */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Engines</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handlePresetEngineClick('cinematic')}
                  tooltip="Creative Engine"
                >
                  <Video />
                  <span>Creative Engine</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handlePresetEngineClick('poster')}
                  tooltip="Outline Planner"
                >
                  <Layout />
                  <span>Outline Planner</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handlePresetEngineClick('realism')}
                  tooltip="Minimalist Studio"
                >
                  <SlidersHorizontal />
                  <span>Minimalist Studio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="group-data-[collapsible=icon]:hidden" />

        {/* Recent Decks */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Recent Slide Decks</SidebarGroupLabel>
          <SidebarGroupContent>
            {loadingDecks ? (
              <div className="px-2 text-xs text-sidebar-foreground/60 py-1">Loading...</div>
            ) : filteredDecks.length === 0 ? (
              <div className="px-2 text-xs text-sidebar-foreground/50 italic py-1">
                {searchTerm ? 'No matches found' : 'Saved blueprints coming soon.'}
              </div>
            ) : (
              <SidebarMenu>
                {filteredDecks.map((deck) => (
                  <SidebarMenuItem key={deck._id}>
                    <SidebarMenuButton
                      onClick={() => openPresentation(deck._id)}
                      size="sm"
                      className="text-xs"
                    >
                      <span className="truncate">{deck.title || 'Untitled Presentation'}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
              tooltip={getUsername()}
            >
              <div className="w-6 h-6 rounded-md bg-accent text-accent-foreground flex items-center justify-center font-bold text-xs shrink-0">
                {getUserInitials()}
              </div>
              <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-semibold text-sidebar-foreground truncate leading-none mb-0.5">
                  {getUsername()}
                </span>
                <span className="text-[10px] text-sidebar-foreground/50 truncate leading-none">
                  SlideOS Workspace
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {showLogoutConfirm && (
          <div className="p-2 flex flex-col gap-2 border-t border-sidebar-border group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-semibold text-sidebar-foreground text-center">Logout?</span>
            <div className="flex gap-2">
              <Button onClick={onLogout} size="sm" variant="destructive" className="flex-1 text-xs">
                Logout
              </Button>
              <Button
                onClick={() => setShowLogoutConfirm(false)}
                size="sm"
                variant="destructive"
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
