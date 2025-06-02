export function CreateOrganization() {
  return (
    <div className="pl-5 bg-white p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-bold mb-4">Organization Details</h3>
    <form>
      <label className="block mb-2">Organization Name</label>
      <input
        type="text"
        className="w-full mb-4 p-2 border border-gray-300 rounded"
      />

      <label className="block mb-2">Location</label>
      <input
        type="text"
        className="w-full mb-4 p-2 border border-gray-300 rounded"
      />

      <button className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-700">
        Create Organization
      </button>
    </form>
  </div>
  );
}