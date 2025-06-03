import { useState } from "react";
import { AvailabilityType } from "../types/Availability";

type EditAvailabilityModalProps = {
  availability: AvailabilityType;
  onClose: () => void;
  onSave: (updatedAvailability: AvailabilityType) => void;
};

export function EditAvailabilityModal({
  availability,
  onClose,
  onSave,
}: EditAvailabilityModalProps) {
  const [effectiveStart, setEffectiveStart] = useState(
    availability.effectiveStart
  );
  const [effectiveEnd, setEffectiveEnd] = useState(availability.effectiveEnd);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...availability,
      effectiveStart,
      effectiveEnd,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Edit Availability</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Effective Start</label>
            <input
              type="date"
              value={effectiveStart}
              onChange={(e) => setEffectiveStart(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Effective End</label>
            <input
              type="date"
              value={effectiveEnd}
              onChange={(e) => setEffectiveEnd(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
