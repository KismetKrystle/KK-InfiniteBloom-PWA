import { redirect } from "next/navigation"

// read.kismetkrystle.com is just the reader now — the portfolio and shop
// live on www.kismetkrystle.com.
export default function Page() {
  redirect("/flipbook")
}
