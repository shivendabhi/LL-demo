function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

interface Tab {
  key: string
  label: string
  icon: React.ReactNode
  count?: number
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabKey: string) => void
}

export default function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex justify-end">
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={classNames(
              "px-4 py-2.5 rounded font-inter text-sm font-medium transition-all duration-200 flex items-center space-x-2",
              activeTab === tab.key
                ? "bg-[#444EAA] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            {tab.icon}
            <span>
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}