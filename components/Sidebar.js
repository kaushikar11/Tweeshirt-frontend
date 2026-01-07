import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu,
  X,
  Settings,
  LogOut,
  Home,
  Image,
  ShoppingBag,
  Trash2,
  ChevronDown,
} from 'lucide-react';

export function Sidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleExpanded = (menu) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  // Close sidebar when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  const menuItems = [
    {
      label: 'Home',
      icon: <Home size={20} />,
      onClick: () => {
        router.push('/');
        setIsOpen(false);
      },
    },
    {
      label: 'My Work',
      icon: <Image size={20} />,
      onClick: () => {
        router.push('/gallery');
        setIsOpen(false);
      },
    },
    {
      label: 'Order History',
      icon: <ShoppingBag size={20} />,
      onClick: () => {
        router.push('/orders');
        setIsOpen(false);
      },
    },
    {
      label: 'Settings',
      icon: <Settings size={20} />,
      submenu: [
        {
          label: 'Profile',
          onClick: () => {
            router.push('/profile');
            setIsOpen(false);
          },
        },
        {
          label: 'Account Settings',
          onClick: () => {
            router.push('/settings');
            setIsOpen(false);
          },
        },
      ],
    },
    {
      label: 'Delete Account',
      icon: <Trash2 size={20} />,
      className: 'text-red-500 hover:bg-red-500/10',
      onClick: () => {
        if (
          window.confirm(
            'Are you sure you want to delete your account? This action cannot be undone.'
          )
        ) {
          router.push('/delete-account');
          setIsOpen(false);
        }
      },
    },
    {
      label: 'Logout',
      icon: <LogOut size={20} />,
      className: 'text-orange-500 hover:bg-orange-500/10',
      onClick: async () => {
        await signOut({ redirect: true, callbackUrl: '/' });
      },
    },
  ];

  const handleMenuItemClick = (onClick) => {
    onClick();
    setIsOpen(false);
  };

  return null;
        {/* Header */}
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name}
                className="w-14 h-14 rounded-full border-2 border-white/20 object-cover"
              />
            )}
            <div>
              <p className="text-white font-semibold text-base">{session?.user?.name}</p>
              <p className="text-gray-400 text-sm truncate max-w-[200px]">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item, index) => (
            <div key={index}>
              <button
                onClick={() => {
                  if (item.submenu) {
                    toggleExpanded(item.label);
                  } else {
                    handleMenuItemClick(item.onClick);
                  }
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-gray-200 transition-all ${
                  item.className || 'hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </span>
                {item.submenu && (
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${
                      expandedMenu === item.label ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Submenu */}
              {item.submenu && expandedMenu === item.label && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.submenu.map((subitem, subindex) => (
                    <button
                      key={subindex}
                      onClick={() => handleMenuItemClick(subitem.onClick)}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                    >
                      {subitem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
