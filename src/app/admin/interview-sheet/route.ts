import { currentFaculty } from "@/server/auth";
import { listInbox } from "@/server/content";
import { buildInterviewSheet, readPreviousSheet } from "@/server/interview-sheet";

// The sheet holds applicants' phone numbers and emails, so it is only ever built for a logged-in faculty member.
const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const MAX_UPLOAD = 5 * 1024 * 1024;

async function respond(req: Request, previous?: Awaited<ReturnType<typeof readPreviousSheet>>) {
  const applications = (await listInbox("applications")).filter((a) => a.status !== "Closed");
  const { buffer, added, total } = await buildInterviewSheet({
    applications,
    origin: new URL(req.url).origin,
    previous,
  });
  const day = new Date().toISOString().slice(0, 10);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": XLSX,
      "Content-Disposition": `attachment; filename="E-Cell-Interview-Schedule-${day}.xlsx"`,
      "Cache-Control": "private, no-store",
      "X-Sheet-Added": String(added),
      "X-Sheet-Total": String(total),
    },
  });
}

const fail = (error: string, status: number) => Response.json({ error }, { status });

/** A fresh sheet with everyone who has applied. */
export async function GET(req: Request) {
  if (!(await currentFaculty())) return fail("Please log in again.", 401);
  try {
    return await respond(req);
  } catch (e) {
    console.error("interview sheet failed", e);
    return fail("Could not create the sheet. Please try again.", 500);
  }
}

/** The sheet you already have, with the new candidates added and everything you typed kept. */
export async function POST(req: Request) {
  if (!(await currentFaculty())) return fail("Please log in again.", 401);
  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File) || file.size === 0) return fail("Please choose your interview sheet (.xlsx).", 400);
    if (file.size > MAX_UPLOAD) return fail("That file is too large (max 5 MB).", 400);
    if (!/\.xlsx$/i.test(file.name)) return fail("Please choose the .xlsx file you downloaded from here.", 400);
    let previous;
    try {
      previous = await readPreviousSheet(await file.arrayBuffer());
    } catch (e) {
      return fail(e instanceof Error ? e.message : "That file could not be read.", 400);
    }
    return await respond(req, previous);
  } catch (e) {
    console.error("interview sheet update failed", e);
    return fail("Could not update the sheet. Please try again.", 500);
  }
}
