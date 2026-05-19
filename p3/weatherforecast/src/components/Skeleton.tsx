export function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white/85 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          <div className="space-y-2">
            <div className="w-32 h-8 bg-gray-200 rounded-lg" />
            <div className="w-20 h-4 bg-gray-200 rounded-lg" />
          </div>
          <div className="ml-auto w-12 h-12 bg-gray-200 rounded-xl" />
        </div>

        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-2xl" />
          <div className="space-y-3">
            <div className="w-40 h-16 bg-gray-200 rounded-lg" />
            <div className="w-24 h-6 bg-gray-200 rounded-lg" />
            <div className="w-16 h-5 bg-gray-200 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl p-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto mb-2" />
              <div className="w-12 h-4 bg-gray-200 rounded mx-auto mb-2" />
              <div className="w-16 h-6 bg-gray-200 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl animate-pulse">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-gray-200 rounded-lg" />
          <div className="w-32 h-6 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-64 bg-gray-100 rounded-2xl mb-8" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex-shrink-0 w-28 h-36 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
