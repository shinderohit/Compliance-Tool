import { useEffect, useState } from "react";
import API from "../../api/axios";
import DocumentReviewModal from "../documents/DocumentReviewModal";

export default function CompanyDocumentsModal({ open, company, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [review, setReview] = useState({ open: false, url: null, name: null });

  useEffect(() => {
    const fetchDocuments = async () => {
      const res = await API.get(`/company/${company.id}/documents`);

      setDocuments(res.data.documents || []);
    };

    if (open && company?.id) {
      fetchDocuments();
    }
  }, [open, company]);

  if (!open || !company) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[900px]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Documents</h2>
          <button onClick={onClose} className="bg-red-600 px-3 py-1 rounded">
            X
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Uploaded</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.title}</td>
                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                <td>
                  {doc.fileUrl ? (
                    <button
                      onClick={() =>
                        setReview({
                          open: true,
                          url: doc.fileUrl,
                          name: doc.title,
                        })
                      }
                      className="rounded-md border border-[#CBCBD4] px-3 py-1 text-sm font-semibold"
                    >
                      Document Review
                    </button>
                  ) : (
                    <span className="text-sm text-[#18206F]/60">No file</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DocumentReviewModal
        open={Boolean(review?.open)}
        url={review?.url}
        name={review?.name}
        onClose={() => setReview({ open: false, url: null, name: null })}
      />
    </div>
  );
}
