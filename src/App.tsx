import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Abstract/Footer";
import Header from "./components/Abstract/Header";
import Home from "./pages/Home";
import Housing from "./pages/Housing";
import HousingDetails from "./pages/HousingDetails";
import _404 from "./pages/404";
import "./App.css";

function App() {
  return (
    <main className="bg-gray-50 min-h-screen flex flex-col">
      <Header />
      <div className="px-8 xl:px-0 flex-1">
        <div className="relative z-10">
          <BrowserRouter>
            <Routes>
              <Route index element={<Home />} />
              <Route path="/housing" element={<Housing />} />
              <Route path="/housing/:id" element={<HousingDetails />} />

              <Route path="*" element={<_404 />} />
            </Routes>
          </BrowserRouter >
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default App;
