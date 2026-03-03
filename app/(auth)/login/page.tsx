import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form
        className="w-full space-y-4 rounded-2xl border p-6"
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/dashboard",
          });
        }}
      >
        <h1 className="text-xl font-semibold">Sign in</h1>
        <input name="email" type="email" className="w-full rounded border p-2" placeholder="Email" />
        <input name="password" type="password" className="w-full rounded border p-2" placeholder="Password" />
        <button className="w-full rounded bg-blue-600 py-2 text-white" type="submit">Continue</button>
      </form>
    </main>
  );
}
