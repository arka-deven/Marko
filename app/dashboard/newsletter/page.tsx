import { createClient } from "@/lib/supabase/server"

export default async function NewsletterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single()

  const firstName = profile?.full_name?.split(" ")[0] ?? "there"

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-2xl font-bold text-foreground mb-2">Newsletter</h1>
      <p className="text-muted-foreground text-sm max-w-md">
        Newsletter management is coming soon, {firstName}. You&apos;ll be able to compose, schedule, and send newsletters from here.
      </p>
    </div>
  )
}
