export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-8">

      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Sistem Ulangan Siswa
        </h2>
        <p className="text-sm text-gray-500">
          Kelola data dan hasil ulangan siswa
        </p>
      </div>

      <div className="flex items-center gap-4">

        {/* Notification */}
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <span className="text-xl">♢</span>

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
            AD
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              Administrator
            </p>
            <p className="text-xs text-gray-500">
              Admin
            </p>
          </div>
        </div>

      </div>

    </header>
  );
}