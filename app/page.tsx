import HomePage from "../components/ui/HomePage";
import { redirect } from "next/navigation";

type HomeProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = (await searchParams) ?? {}

  if (typeof resolvedSearchParams.code === "string") {
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(resolvedSearchParams)) {
      if (typeof value === "string") {
        params.set(key, value)
      }
    }

    redirect(`/reset?${params.toString()}`)
  }

  return (
    <div>
      <HomePage/>
    </div>
  );
}
