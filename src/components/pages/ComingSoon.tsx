import React from 'react';

const ComingSoon: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-custom">
      <div className="text-center px-6 py-12 bg-white/10 backdrop-blur rounded-2xl shadow-xl max-w-xl w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Coming Soon</h1>
        <p className="text-white/90 text-lg md:text-xl mb-8">
          We're preparing something great. Please check back shortly.
        </p>
        <div className="text-white/70 text-sm">
          © {new Date().getFullYear()} Rezi
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;


