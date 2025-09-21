import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Team from "./pages/team";
// import Team from "./pages/Team"; // Capitalized filename for convention
import Navbar from "./components/NavBar";
import SignLanguageTranslator from "./components/SignLanguageTranslator";
import SignLearning from "./components/SignLearning";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/translate" element={<SignLanguageTranslator />} />
          <Route path="/learn" element={<SignLearning />} />
          <Route path="/" element={<Index />} />
          <Route path="/team" element={<Team />} />
          {/* Catch-all route for 404 pages */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
