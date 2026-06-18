import React from 'react';
import './Footer.css'; // import the CSS file

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h4 className="footer-heading">കെയിരളി ന്യൂസ്</h4>
          <ul className="footer-list">
            <li><a href="#" className="footer-link">ഞങ്ങളെക്കുറിച്ച്</a></li>
            <li><a href="#" className="footer-link">ബന്ധപ്പെടുക</a></li>
            <li><a href="#" className="footer-link">പരസ്യം</a></li>
          </ul>
        </div>
        <div>
          <h4 className="footer-heading">വിഭാഗങ്ങൾ</h4>
          <ul className="footer-list">
            <li><a href="#" className="footer-link">വാർത്ത</a></li>
            <li><a href="#" className="footer-link">വിനോദം</a></li>
            <li><a href="#" className="footer-link">കായികം</a></li>
          </ul>
        </div>
        <div>
          <h4 className="footer-heading">സേവനങ്ങൾ</h4>
          <ul className="footer-list">
            <li><a href="#" className="footer-link">RSS ഫീഡ്</a></li>
            <li><a href="#" className="footer-link">മൊബൈൽ ആപ്പ്</a></li>
            <li><a href="#" className="footer-link">ന്യൂസ് അലേർട്ട്</a></li>
          </ul>
        </div>
        <div>
          <h4 className="footer-heading">സോഷ്യൽ</h4>
          <ul className="footer-list">
            <li><a href="#" className="footer-link">ഫേസ്ബുക്ക്</a></li>
            <li><a href="#" className="footer-link">ട്വിറ്റർ</a></li>
            <li><a href="#" className="footer-link">യൂട്യൂബ്</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-copyright">
        © 2026 kairalinewsonline.com. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;