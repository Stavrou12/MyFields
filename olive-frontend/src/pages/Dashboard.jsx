export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/my-fields" className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700">
          <h3 className="text-lg font-semibold">My Fields</h3>
          <p>View and manage your olive fields</p>
        </a>
        <a href="/add-field" className="bg-green-500 text-white p-6 rounded-lg hover:bg-green-600">
          <h3 className="text-lg font-semibold">Add Field</h3>
          <p>Draw a polygon and save a new field</p>
        </a>
      </div>
    </div>
  );
}