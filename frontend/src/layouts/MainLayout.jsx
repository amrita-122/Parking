import { Navbar } from "../components/Navbar";

export const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto py-4 px-2">
        {children}
      </main>
    </div>
  );
};