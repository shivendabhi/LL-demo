import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  showAuthButtons?: boolean;
}

export default function Header({ showAuthButtons = true }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="bg-white/90 backdrop-blur-2xl border border-[#444EAA]/20 rounded-full px-8 py-4 shadow-[0_8px_32px_rgba(68,78,170,0.15)] hover:shadow-[0_8px_40px_rgba(68,78,170,0.25)] transition-all duration-500">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Tally Logo"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="font-sans text-xl font-medium text-[#444EAA] tracking-[-0.01em]">Tally</span>
            </Link>
            {showAuthButtons && (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <button className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium px-5 py-2.5 rounded-full hover:bg-gray-50/80">
                    Sign in
                  </button>
                </Link>
                <Link href="/register">
                  <button className="bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all duration-200 shadow-sm">
                    Sign up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}