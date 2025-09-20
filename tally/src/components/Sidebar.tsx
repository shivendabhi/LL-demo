import { signOut } from "next-auth/react"
import { Session } from "next-auth"

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

interface NavigationItem {
  label: string
  key: string
  icon: React.ReactNode
}

interface SidebarProps {
  session: Session
  currentPage: 'materials' | 'products' | 'fulfillment'
  onPageChange: (page: 'materials' | 'products' | 'fulfillment') => void
  isHovered: boolean
  onHover: (hovered: boolean) => void
}

export default function Sidebar({ session, currentPage, onPageChange, isHovered, onHover }: SidebarProps) {
  const navigationItems: NavigationItem[] = [
    {
      label: "Materials",
      key: "materials",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      label: "Products",
      key: "products",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      label: "Fulfillment",
      key: "fulfillment",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )
    },
  ]

  const integrationItems = [
    {
      label: "Integrations",
      active: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
  ]

  return (
    <aside
      className={classNames(
        "bg-white/95 backdrop-blur-xl border-r border-[#444EAA]/10 transition-all duration-500 ease-out flex flex-col group",
        isHovered ? "w-64" : "w-16"
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Logo */}
      <div className={classNames(
        "flex items-center transition-all duration-500 ease-out p-3 mb-0",
        isHovered ? "px-2" : "justify-center"
      )}>
        <img
          src="/logo.png"
          alt="Tally Logo"
          className="w-6 h-6 flex-shrink-0"
        />
        <span className={classNames(
          "ml-2 font-sans text-lg font-medium text-[#444EAA] tracking-[-0.01em] transition-all duration-500 ease-out whitespace-nowrap overflow-hidden",
          isHovered ? "opacity-100 max-w-xs" : "opacity-0 max-w-0 ml-0"
        )}>
          Tally
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 pt-1 pb-1">
        {navigationItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onPageChange(item.key as 'materials' | 'products' | 'fulfillment')}
            className={classNames(
              "w-full flex items-center px-2 py-2 rounded transition-colors duration-300 ease-out group relative",
              currentPage === item.key
                ? "bg-[#444EAA]/10 text-[#444EAA]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
            <span className={classNames(
              "ml-2 font-inter text-sm font-medium transition-all duration-300 ease-out whitespace-nowrap overflow-hidden",
              isHovered ? "opacity-100 max-w-xs" : "opacity-0 max-w-0 ml-0"
            )}>
              {item.label}
            </span>
          </button>
        ))}

        {/* Divider */}
        <div className="border-t border-gray-200 my-2 mx-2"></div>

        {integrationItems.map((item) => (
          <button
            key={item.label}
            className={classNames(
              "w-full flex items-center px-2 py-2 rounded transition-colors duration-300 ease-out group",
              item.active
                ? "bg-[#444EAA]/10 text-[#444EAA] shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
            <span className={classNames(
              "ml-2 font-inter text-sm font-medium transition-all duration-300 ease-out whitespace-nowrap overflow-hidden",
              isHovered ? "opacity-100 max-w-xs" : "opacity-0 max-w-0 ml-0"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-[#444EAA]/10 p-2">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center px-2 py-2 rounded transition-colors duration-300 ease-out text-red-600 hover:bg-red-50 relative mb-2"
        >
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className={classNames(
            "ml-2 font-inter text-sm font-medium transition-all duration-300 ease-out whitespace-nowrap overflow-hidden",
            isHovered ? "opacity-100 max-w-xs" : "opacity-0 max-w-0 ml-0"
          )}>
            Sign out
          </span>
        </button>

        <div className={classNames(
          "flex items-center transition-all duration-300 ease-out",
          isHovered ? "px-2" : "justify-center"
        )}>
          <div className="w-6 h-6 bg-gradient-to-br from-[#444EAA] to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-medium">
              {(session.user?.name || session.user?.email || "U")[0].toUpperCase()}
            </span>
          </div>
          <div className={classNames(
            "flex-1 min-w-0 transition-all duration-300 ease-out overflow-hidden",
            isHovered ? "ml-2 opacity-100 max-w-xs" : "ml-0 opacity-0 max-w-0"
          )}>
            <p className="text-sm font-medium text-gray-900 truncate whitespace-nowrap">
              {session.user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate whitespace-nowrap">
              {session.user?.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}