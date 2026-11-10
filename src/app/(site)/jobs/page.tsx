import { Suspense } from "react";
import { JobsView } from "@/components/jobs/JobsView";
import { getContent } from "@/server/content";

export default async function Jobs() {
  const { listings } = await getContent();
  // useSearchParams (for the ?apply= deep link) needs a Suspense boundary.
  return (
    <Suspense>
      <JobsView listings={listings} />
    </Suspense>
  );
}
