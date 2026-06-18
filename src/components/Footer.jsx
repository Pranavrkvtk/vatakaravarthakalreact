import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-top">
        <h2 className="footer-logo">വടകര വാർത്തകൾ</h2>
        <p className="footer-description">
          വടകരയിലെയും കേരളത്തിലെയും ഏറ്റവും പുതിയ വാർത്തകൾ,
          വിശകലനങ്ങൾ, പ്രാദേശിക വിവരങ്ങൾ എന്നിവ വിശ്വസനീയമായി
          നിങ്ങളിലേക്ക് എത്തിക്കുന്നു.
        </p>
      </div>

      <div className="footer-grid">

        <div>
          <h4 className="footer-heading">ഞങ്ങളെക്കുറിച്ച്</h4>
          <ul className="footer-list">
            <li><a href="#" className="footer-link">ഞങ്ങളെക്കുറിച്ച്</a></li>
            <li><a href="#" className="footer-link">ബന്ധപ്പെടുക</a></li>
            <li><a href="#" className="footer-link">പരസ്യം നൽകുക</a></li>
            <li><a href="#" className="footer-link">സ്വകാര്യതാ നയം</a></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">വിഭാഗങ്ങൾ</h4>
          <ul className="footer-list">
            <li><a href="#" className="footer-link">പ്രാദേശികം</a></li>
            <li><a href="#" className="footer-link">കേരളം</a></li>
            <li><a href="#" className="footer-link">ദേശീയം</a></li>
            <li><a href="#" className="footer-link">വിദേശം</a></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">പ്രധാന വിഭാഗങ്ങൾ</h4>
          <ul className="footer-list">
            <li><a href="#" className="footer-link">വിനോദം</a></li>
            <li><a href="#" className="footer-link">വിദ്യാഭ്യാസം</a></li>
            <li><a href="#" className="footer-link">യാത്ര</a></li>
            <li><a href="#" className="footer-link">സാമ്പത്തികം</a></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">സോഷ്യൽ മീഡിയ</h4>
          <ul className="footer-list">
            <li><a href="#" className="footer-link">Facebook</a></li>
            <li><a href="#" className="footer-link">Instagram</a></li>
            <li><a href="#" className="footer-link">YouTube</a></li>
            <li><a href="#" className="footer-link">WhatsApp Channel</a></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 വടകര വാർത്തകൾ | All Rights Reserved
      </div>

    </footer>
  );
};

export default Footer;