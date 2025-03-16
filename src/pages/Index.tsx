
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Dashboard when the app loads
    navigate("/dashboard");
  }, [navigate]);

  return null;
};

export default Index;
