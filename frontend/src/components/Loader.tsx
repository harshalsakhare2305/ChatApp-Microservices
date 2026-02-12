import React from 'react'

function Loader() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-gray-900 min-h-screen">
      <div className="h-12 w-12 border-4 border-solid border-white border-t-transparent rounded-full animate-spin" />
      
    </div>
  );
}




export default Loader