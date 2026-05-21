export function RequestsFilter() {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Cari pengajuan..."
        className="px-4 py-2 border rounded-xl bg-white text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      <select className="px-4 py-2 border rounded-xl bg-white text-sm text-gray-600 focus:outline-none">
        <option>Semua Status</option>
      </select>
      <select className="px-4 py-2 border rounded-xl bg-white text-sm text-gray-600 focus:outline-none">
        <option>Semua Cabang</option>
      </select>
      <select className="px-4 py-2 border rounded-xl bg-white text-sm text-gray-600 focus:outline-none">
        <option>Semua Urgensi</option>
      </select>
    </div>
  );
}
