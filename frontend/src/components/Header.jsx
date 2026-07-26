import { Link, useNavigate } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';

const engineLinks = [
  {
    title: 'Creative Engine',
    href: '/?engine=creative',
    description: 'Generate visually stunning presentations with AI-powered design.',
  },
  {
    title: 'Outline Planner',
    href: '/?engine=outline',
    description: 'Structure your ideas into a clear, well-organized outline.',
  },
  {
    title: 'Minimalist Studio',
    href: '/?engine=minimalist',
    description: 'Clean, focused slides that let your content shine.',
  },
];

export function Header({ themeColors, isAuthenticated }) {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-lg transition-all duration-500"
      style={{
        borderBottom: `1px solid ${themeColors?.primary}40`,
        backgroundColor: `${themeColors?.background}CC`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              type="button"
              className="text-sm font-semibold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 cursor-pointer"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors?.primary}, ${themeColors?.accent})`,
              }}
            >
              SlideOS
            </button>

            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {isAuthenticated && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Engines</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {engineLinks.map((engine) => (
                          <li key={engine.title}>
                            <NavigationMenuLink asChild>
                              <Link to={engine.href}>
                                <div className="flex flex-col gap-1 text-sm">
                                  <div className="leading-none font-medium">
                                    {engine.title}
                                  </div>
                                  <div className="line-clamp-2 text-muted-foreground">
                                    {engine.description}
                                  </div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to="/my-presentations">Library</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
