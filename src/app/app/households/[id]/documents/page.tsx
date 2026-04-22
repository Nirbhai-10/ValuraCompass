import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getHouseholdForUser } from "@/lib/household";
import { uploadDocumentAction, runOcrAction, deleteDocumentAction } from "./actions";
import { prisma } from "@/lib/prisma";

const DOC_TYPES = ["STATEMENT", "ITR", "FORM16", "POLICY", "LOAN", "ID", "WILL", "OTHER"];

export default async function DocumentsPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const h = await getHouseholdForUser(session.userId, params.id);
  if (!h) redirect("/app");

  const docs = await prisma.document.findMany({
    where: { householdId: h.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h2 className="font-semibold">Upload document</h2>
          <p className="text-xs text-ink-500">
            Manual-first with an OCR placeholder. The live OCR extraction is an external integration
            (see README); today, Compass stores and classifies your documents locally and runs a
            placeholder extractor that returns no invented fields.
          </p>
        </div>
        <form action={uploadDocumentAction} className="card-body grid gap-3 md:grid-cols-3" encType="multipart/form-data">
          <input type="hidden" name="householdId" value={h.id} />
          <div className="md:col-span-2">
            <label className="label">File (PDF, PNG, JPG)</label>
            <input className="input" name="file" type="file" accept=".pdf,.png,.jpg,.jpeg" required />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" name="type" defaultValue="STATEMENT">
              {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="md:col-span-3">
            <button className="btn-primary">Upload</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-semibold">Documents</h2>
          <span className="text-xs text-ink-500">{docs.length} file(s)</span>
        </div>
        <div className="card-body">
          {docs.length === 0 ? (
            <p className="text-sm text-ink-500">No documents uploaded yet.</p>
          ) : (
            <table className="w-full table">
              <thead>
                <tr><th>Name</th><th>Type</th><th>Size</th><th>OCR</th><th>Uploaded</th><th></th></tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td className="font-medium">
                      {d.storagePath ? (
                        <a className="link" href={`/${d.storagePath}`} target="_blank" rel="noreferrer">{d.originalName}</a>
                      ) : (
                        d.originalName
                      )}
                    </td>
                    <td className="text-ink-500">{d.type}</td>
                    <td className="text-ink-500 tabular-nums">{(d.size / 1024).toFixed(1)} KB</td>
                    <td className="text-ink-500">{d.ocrStatus}</td>
                    <td className="text-ink-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="text-right">
                      <form action={runOcrAction} className="inline-block">
                        <input type="hidden" name="householdId" value={h.id} />
                        <input type="hidden" name="id" value={d.id} />
                        <button className="btn-ghost text-xs">Run OCR (placeholder)</button>
                      </form>
                      <form action={deleteDocumentAction} className="inline-block">
                        <input type="hidden" name="householdId" value={h.id} />
                        <input type="hidden" name="id" value={d.id} />
                        <button className="btn-ghost text-xs">Remove</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
