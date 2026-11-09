import { currentFaculty } from "@/server/auth";
import { photoStorageConfigurationError, readBinary } from "@/server/media-store";

// Applicant CVs are personal data: unlike photos they are never public, only logged-in faculty can open them.
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!(await currentFaculty())) return new Response("Unauthorized", { status: 401 });
  const storageError = photoStorageConfigurationError();
  if (storageError) return new Response(storageError, { status: 503 });
  const { name } = await params;
  if (!/^[\w-]+\.pdf$/.test(name)) return new Response("Not found", { status: 404 });
  const file = await readBinary(`cv/${name}`);
  if (!file) return new Response("Not found", { status: 404 });
  const body = file.body instanceof ReadableStream ? file.body : new Uint8Array(file.body);
  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
