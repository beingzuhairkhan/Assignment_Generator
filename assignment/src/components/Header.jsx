import { Github } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full bg-black text-white shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6 sm:px-10 py-4 gap-4 sm:gap-0 transition-all duration-300">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          {/* Optional image-based logo */}
          {/* <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full" /> */}

          {/* SVG Logo */}
          <div className="w-8 h-8 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 50 50"
              width="32"
              height="32"
              fill="white"
            >
              <path d="M22.462 11.035l2.88 7.097c1.204 2.968 3.558 5.322 6.526 6.526l7.097 2.88c1.312.533 1.312 2.391 0 2.923l-7.097 2.88c-2.968 1.204-5.322 3.558-6.526 6.526l-2.88 7.097c-.533 1.312-2.391 1.312-2.923 0l-2.88-7.097c-1.204-2.968-3.558-5.322-6.526-6.526l-7.097-2.88c-1.312-.533-1.312-2.391 0-2.923l7.097-2.88c2.968-1.204 5.322-3.558 6.526-6.526l2.88-7.097C20.071 9.723 21.929 9.723 22.462 11.035zM39.945 2.701l.842 2.428c.664 1.915 2.169 3.42 4.084 4.084l2.428.842c.896.311.896 1.578 0 1.889l-2.428.842c-1.915.664-3.42 2.169-4.084 4.084l-.842 2.428c-.311.896-1.578.896-1.889 0l-.842-2.428c-.664-1.915-2.169-3.42-4.084-4.084l-2.428-.842c-.896-.311-.896-1.578 0-1.889l2.428-.842c1.915-.664 3.42-2.169 4.084-4.084l.842-2.428C38.366 1.805 39.634 1.805 39.945 2.701z" />
            </svg>
          </div>

          <h1 className="text-lg sm:text-xl font-semibold">
            Assignment Generator AI
          </h1>
        </div>

        {/* GitHub Link */}
        <a
          href="https://github.com/beingzuhairkhan"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full border border-current hover:scale-110 transition"
          title="View on GitHub"
        >
          <Github size={20} />
        </a>
      </div>
    </header>
  );
};

export default Header;
