import Breadcrumb from './Breadcrumb'

export default function FulfillmentPage() {
  return (
    <div className="flex justify-center">
      <div className="max-w-6xl w-full">
        <Breadcrumb items={[
          { label: 'Fulfillment' }
        ]} />

        <div className="bg-white/90 backdrop-blur-xl border border-[#444EAA]/20 rounded shadow-sm overflow-hidden">
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="font-sans text-lg font-medium text-gray-900 mb-2">Fulfillment Center</h3>
            <p className="text-gray-600 font-inter text-sm">Production tracking and shipping logistics coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}