interface BreadcrumbProps {
  items: { label: string; active?: boolean }[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div>
      <div className="flex items-center space-x-3 text-gray-600">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className={`font-inter text-3xl font-medium ${
              item.active ? 'text-[#444EAA]' : 'text-gray-900'
            }`}>
              {item.label}
            </span>
            {index < items.length - 1 && (
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}