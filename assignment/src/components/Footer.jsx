const Footer = () => {
  return (
    <footer className="bg-black text-white border-t border-gray-700 py-6 ">
     
        {/* Center: Links or Info */}
        <center className="text-sm text-gray-400 text-center ">
          © {new Date().getFullYear()} Zuhair Khan. All rights reserved.
        </center>

       
    </footer>
  );
};

export default Footer;
