import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BiError } from 'react-icons/bi';
import { AiOutlineHome } from 'react-icons/ai';
import { IoArrowBack } from 'react-icons/io5';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';

interface NotFoundProps {
  type: 'notFound' | 'unauthorized';
}

const NotFound: React.FC<NotFoundProps> = ({ type }) => {
  const navigate = useNavigate();

  // ✅ Sign out and redirect to login
  const handleSignOut = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const title = type === 'unauthorized' ? 'Unauthorized Access' : 'Page Not Found';
  const code = type === 'unauthorized' ? '403' : '404';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-7xl w-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* LEFT: Illustration */}
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="relative w-full max-w-md text-center">

              <h3 className="text-lg font-semibold text-blue-600 mb-4 tracking-wide uppercase">
                Access Status
              </h3>

              <div className="absolute inset-0 bg-blue-300 blur-[120px] opacity-25 rounded-full" />

              <div className="relative p-10">

                {/* Head */}
                <div
                  className="w-56 h-56 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full relative shadow-2xl"
                  style={{ animation: 'bounce 2s ease-in-out infinite' }}
                >
                  <div className="absolute top-20 left-16 w-10 h-14 bg-gray-900 rounded-full" />
                  <div className="absolute top-20 right-16 w-10 h-14 bg-gray-900 rounded-full" />

                  <div
                    className="absolute top-32 left-[4.6rem] w-3 h-10 bg-blue-200 rounded-full"
                    style={{ animation: 'pulse 1.5s infinite' }}
                  />
                  <div
                    className="absolute top-32 right-[4.6rem] w-3 h-10 bg-blue-200 rounded-full"
                    style={{ animation: 'pulse 1.5s infinite', animationDelay: '0.2s' }}
                  />

                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-20 h-10 border-b-4 border-gray-900 rounded-b-full" />
                </div>

                {/* Body */}
                <div className="w-44 h-28 mx-auto mt-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-xl" />
                <div className="absolute top-[19.5rem] left-16 w-20 h-8 bg-blue-500 rounded-full shadow-lg -rotate-45" />
                <div className="absolute top-[19.5rem] right-16 w-20 h-8 bg-blue-500 rounded-full shadow-lg rotate-45" />
              </div>

              {/* Floating Icons */}
              <div className="absolute top-4 right-4 animate-bounce">
                <HiOutlineExclamationCircle className="text-6xl text-red-400 opacity-70" />
              </div>
              <div className="absolute bottom-20 left-6 animate-bounce delay-200">
                <BiError className="text-5xl text-yellow-400 opacity-70" />
              </div>
              <div className="absolute top-28 left-14 animate-bounce delay-500">
                <BiError className="text-4xl text-orange-400 opacity-60" />
              </div>
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {code}
            </h1>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {title}
            </h2>

            <p className="text-gray-600 text-lg leading-relaxed max-w-xl mb-10">
              {type === 'unauthorized'
                ? "You don’t have permission to access this page. Please login first to continue."
                : "The page you’re trying to reach doesn’t exist or may have been moved. Please verify the URL or return home."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => window.history.back()}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <IoArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
                Go Back
              </button>

              <button
                onClick={handleSignOut}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all"
              >
                <AiOutlineHome className="text-xl group-hover:scale-110 transition-transform" />
                Go to Login
              </button>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-400 font-mono">
                Error Code: <span className="text-red-500 font-bold" role="alert">{code}</span> | {title}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Icons */}
        <div className="mt-20 flex justify-center gap-4 text-gray-300">
          <BiError className="text-4xl animate-pulse" />
          <BiError className="text-4xl animate-pulse delay-200" />
          <BiError className="text-4xl animate-pulse delay-500" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
