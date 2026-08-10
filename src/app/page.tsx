import { redirect } from "next/navigation";

export default function Root() {
  // No real session; prototype lands on /login every time. Once signed in
  // the login page pushes to /home.
  redirect("/login");
}
