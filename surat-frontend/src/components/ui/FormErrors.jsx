import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

/**
 * FormErrors — Menampilkan error validasi per-field dari backend (422).
 *
 * Backend mengembalikan format: { errors: { field: ["pesan1", "pesan2"] } }
 *
 * Props:
 *   errors — object { field: string[] } dari response.data.errors
 *   fieldLabels — optional mapping { field_name: "Label" } untuk relabel field
 *
 * Jika errors null/undefined/empty, komponen tidak ditampilkan.
 */
export default function FormErrors({ errors, fieldLabels = {} }) {
  if (!errors || typeof errors !== 'object') return null;

  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2"
      role="alert"
    >
      <div className="flex items-center gap-2 mb-1">
        <ShieldExclamationIcon className="h-5 w-5 text-red-500 shrink-0" />
        <p className="text-sm font-semibold text-red-700">
          Terdapat kesalahan pada form:
        </p>
      </div>

      <ul className="space-y-1 pl-7">
        {entries.map(([field, messages]) => {
          const label = fieldLabels[field] || field.replace(/_/g, ' ');
          const messageList = Array.isArray(messages) ? messages : [messages];

          return messageList.map((msg, i) => (
            <li key={`${field}-${i}`} className="text-sm text-red-600">
              <span className="font-medium capitalize">{label}</span>: {msg}
            </li>
          ));
        })}
      </ul>
    </div>
  );
}
