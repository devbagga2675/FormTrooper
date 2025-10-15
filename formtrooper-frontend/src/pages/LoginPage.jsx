import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// 2. Import the specific icon data you need
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
// A simple component for the FormTrooper logo
const FormTrooperLogo = ({ className }) => (
  <div
    className={`flex items-center justify-center bg-gray-800 rounded-md h-8 w-8 ${className}`}
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 16H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

// A specific Google Icon for the button
const GoogleIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12.25V14.17H18.2C17.94 15.71 17.03 16.97 15.61 17.89V20.5H19.49C21.49 18.69 22.56 15.77 22.56 12.25Z"
      fill="#4285F4"
    />
    <path
      d="M12.25 23C15.24 23 17.77 22.01 19.49 20.5L15.61 17.89C14.59 18.57 13.33 18.98 12.25 18.98C10.05 18.98 8.16 17.58 7.49 15.64H3.5V18.33C5.23 21.19 8.51 23 12.25 23Z"
      fill="#34A853"
    />
    <path
      d="M7.49 15.64C7.23 14.86 7.08 14.05 7.08 13.21C7.08 12.37 7.23 11.56 7.49 10.78V8.09H3.5C2.56 9.92 2 11.75 2 13.21C2 14.67 2.56 16.5 3.5 18.33L7.49 15.64Z"
      fill="#FBBC05"
    />
    <path
      d="M12.25 7.44C13.43 7.44 14.47 7.84 15.28 8.6L19.55 4.5C17.77 2.85 15.24 1.86 12.25 1.86C8.51 1.86 5.23 4.25 3.5 7.09L7.49 9.78C8.16 7.84 10.05 6.44 12.25 6.44V7.44Z"
      fill="#EA4335"
    />
  </svg>
);

const LoginPage = () => {
  // This function now contains the actual login logic
  const handleGoogleLogin = () => {
    // This redirects the user to the backend's Google authentication endpoint
    window.location.href = "http://localhost:8080/api/auth/google";
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#111111] font-sans">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center p-12">
          <div className="flex items-center gap-3 mb-8">
            <FormTrooperLogo />
            <h1 className="text-xl font-bold text-gray-800">FormTrooper</h1>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get Started</h2>
          <p className="text-gray-600 mb-8">
            Create intelligent forms and quizzes in seconds.
          </p>

          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
          >
            <FontAwesomeIcon icon={faGoogle} color="#444444" />
            <div>Sign in with Google</div>
          </button>

          <p className="mt-8 text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service.
          </p>
        </div>

        <div className="relative hidden select-none flex-col justify-center overflow-hidden bg-neutral-900 p-12 text-white md:flex">
          <div className="z-10">
            <h2 className="mt-4 text-4xl font-bold">Your AI Form Assistant</h2>
            <p className="mt-4 max-w-md text-neutral-400">
              Go from a simple idea to a complete form, survey, or quiz in
              seconds. Let AI do the heavy lifting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
