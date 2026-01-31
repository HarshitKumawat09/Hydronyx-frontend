import Link from "next/link";
import { Linkedin, Twitter, Github, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-cyan-500/20 bg-gradient-to-b from-[#0a1428] to-[#071020]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3">HydroAI</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Leveraging Physics-Informed AI for sustainable groundwater
              management.
            </p>

            <div className="flex items-center gap-4 mt-5">
              <Link href="#" className="text-gray-400 hover:text-cyan-400 transition">
                <Linkedin size={18} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-cyan-400 transition">
                <Twitter size={18} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-cyan-400 transition">
                <Github size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Forecast", href: "/forecast" },
                { label: "Policy", href: "/policy" },
                { label: "Optimizer", href: "/optimizer" },
                { label: "Validation", href: "/validation" },
                { label: "Alerts", href: "/alerts" },
                { label: "Drivers", href: "/drivers" },
                { label: "About Us", href: "/" },
              ].map(
                (item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-cyan-400 transition"
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              {["Documentation", "API Access", "Case Studies", "Blog"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="/"
                      className="text-gray-400 hover:text-cyan-400 transition"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-cyan-400" />
                inrovai@hydroai.com
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-cyan-400" />
                (800) 755-7333
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-cyan-400 mt-0.5" />
                Wilrain Street, Senhana, FA 97001
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-cyan-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2026 HydroAI. All rights reserved.
          </p>

          <div className="flex gap-4 text-xs">
            <Link href="/" className="text-gray-400 hover:text-cyan-400">
              Privacy Policy
            </Link>
            <Link href="/" className="text-gray-400 hover:text-cyan-400">
              Terms of Service
            </Link>
            <Link href="/" className="text-gray-400 hover:text-cyan-400">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
