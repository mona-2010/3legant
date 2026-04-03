import HomePage from "../components/ui/HomePage";
import { redirect } from "next/navigation";

type HomeProps = {
  searchParams?: Record<string, string | string[] | undefined>
}

export default function Home({ searchParams }: HomeProps) {
  if (typeof searchParams?.code === "string") {
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(searchParams)) {
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
