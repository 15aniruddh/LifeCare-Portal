import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import Footer from "./components/common/Footer";
import Header from "./components/common/Header";
import ScrollToTop from "./components/common/ScrollToTop";
import { installAuthInterceptors } from "./services/httpAuth";

// Attach the stored bearer token to every API call before the app renders.
installAuthInterceptors();

const root = createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <ScrollToTop />
    <div className="page">
      <Header />
      <main className="page-body">
        <App />
      </main>
      <Footer />
    </div>
  </BrowserRouter>
);
