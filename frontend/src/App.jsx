import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import "./styles.css";
import "./project-collage.css";
import "./skills.css";
import "./certificates.css";
import "./navbar.css";

export default function App() {
  return <BrowserRouter><AuthProvider><Routes><Route path="/" element={<Home/>}/><Route path="/admin/*" element={<Admin/>}/></Routes></AuthProvider></BrowserRouter>;
}
