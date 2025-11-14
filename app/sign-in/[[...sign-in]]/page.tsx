import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-w-screen min-h-screen items-center justify-center pb-50 bg-gray-100">
      <SignIn />
    </div>
  );
}
