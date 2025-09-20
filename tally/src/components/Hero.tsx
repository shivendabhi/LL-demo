import Link from "next/link";

export default function Hero() {
  return (
    <main className="flex flex-col items-center justify-center h-full px-6 pt-16">
      <div className="max-w-5xl mx-auto text-center relative flex-1 flex flex-col justify-center">
        {/* Subtle accent decoration */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[#444EAA]/60 to-transparent"></div>

        {/* Main Heading */}
        <h1 className="font-sans text-7xl md:text-8xl lg:text-9xl font-medium text-gray-900 mb-10 leading-[0.95] tracking-[-0.025em]">
          Inventory that
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#444EAA]/80 via-[#444EAA] to-[#6366F1]/90">
            never runs out
          </span>
        </h1>

        {/* Subheading */}
        <p className="font-inter text-xl md:text-2xl text-gray-500 mb-14 max-w-3xl mx-auto leading-[1.4] font-light tracking-[-0.005em]">
          Smart inventory management for print-on-demand businesses.
          <br className="hidden sm:block" />
          Track, predict, and reorder with precision.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register">
            <button className="group bg-gray-900 text-white px-10 py-4 rounded-full font-inter text-base font-medium hover:bg-gray-800 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.2)]">
              <span className="flex items-center justify-center">
                Get started
                <svg className="ml-2.5 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </Link>
        </div>
      </div>

      {/* Built by credit - positioned at bottom */}
      <div className="text-center pb-8">
        <p className="text-sm text-gray-400 font-inter tracking-wide">
          Built by Shiven Dabhi
        </p>
      </div>
    </main>
  );
}