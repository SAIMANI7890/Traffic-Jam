import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-3 sm:p-4">
        <Link to="/" className="text-sm sm:text-base font-semibold truncate">
          Restaurant Manager
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          {user ? (
            <>
              <span className="hidden sm:inline text-gray-600">
                {user.username}
              </span>
              <button 
                type="button" 
                className="underline whitespace-nowrap" 
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="whitespace-nowrap">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
