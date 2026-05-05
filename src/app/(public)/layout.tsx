import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Chatbot from "@/components/ui/Chatbot";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="animate-enter">{children}</main>
      <Footer />
      <Chatbot />
    </>
  );
}
