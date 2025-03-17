
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Aggiungiamo un po' di debug
    console.log("Redirecting to dashboard...");
    // Redirect to Dashboard when the app loads
    navigate("/dashboard");
  }, [navigate]);

  // Rendering temporaneo mentre avviene il reindirizzamento
  return <div className="p-4">Caricamento...</div>;
};

export default Index;
