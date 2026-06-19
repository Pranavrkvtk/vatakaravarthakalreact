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

    

      <div className="footer-bottom">
        © 2026 വടകര വാർത്തകൾ | All Rights Reserved
      </div>

    </footer>
  );
};

export default Footer;