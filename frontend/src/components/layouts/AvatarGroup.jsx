import React from 'react';

const AvatarGroup = ({ avatars, maxVisible = 3 }) => {
  return (
    <div className="flex items-center">
      {/* Display the visible avatars */}
      {avatars.slice(0, maxVisible).map((user, index) => {
        // Handle both simple URL strings and User Objects
        const imgSrc = typeof user === 'string' ? user : user?.profileImageUrl;
        const name = typeof user === 'string' ? 'User' : (user?.name || 'Unknown');
        const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

        return (
          <div key={index} className="relative group -ml-3 first:ml-0">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={name}
                className="w-9 h-9 rounded-full border-2 border-white object-cover"
                title={name} // Tooltip
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full border-2 border-white bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
                title={name}
              >
                {initials}
              </div>
            )}
          </div>
        );
      })}

      {/* Display the "+N" indicator if there are more avatars */}
      {avatars.length > maxVisible && (
        <div className="w-9 h-9 flex items-center justify-center bg-blue-50 text-sm font-medium rounded-full border-2 border-white -ml-3 z-10">
          +{avatars.length - maxVisible}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;