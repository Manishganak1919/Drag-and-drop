import React, { forwardRef } from 'react';

const MyNote = forwardRef(({ content, initialPos = { x: 0, y: 0 }, ...props }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        left: `${initialPos.x}px`,
        top: `${initialPos.y}px`,
        position: 'absolute',
      }}
      className="border border-gray-600 select-none p-2 w-[200px] cursor-move bg-[#c7f9cc]"
      {...props}
    >
      📌{content}
    </div>
  );
});

export default MyNote;
