export default function DocumentReviewModal({ open, url, name, onClose }) {
  if (!open) return null;

  const isImage = /\.(png|jpe?g|gif|webp|bmp)$/i.test(name || url || "");
  const isPdf = /\.pdf$/i.test(name || url || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E6E6EE] p-4">
          <div>
            <h3 className="text-lg font-semibold text-[#18206F]">{name}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-[#CBCBD4] px-3 py-1 text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>

        <div
          className="max-h-[80vh] overflow-auto p-4"
          onContextMenu={(e) => e.preventDefault()}
        >
          {isImage ? (
            <img src={url} alt={name} className="mx-auto max-h-[72vh]" />
          ) : isPdf ? (
            <iframe
              title={name}
              src={url}
              className="h-[72vh] w-full"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <object
              data={url}
              type="application/octet-stream"
              className="h-[72vh] w-full"
            >
              <p className="p-4">Preview not available for this file type.</p>
            </object>
          )}
        </div>
      </div>
    </div>
  );
}
