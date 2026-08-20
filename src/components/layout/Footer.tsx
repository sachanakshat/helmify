"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-700 bg-slate-900/50 mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Helmify
            </h3>
            <p className="text-sm text-slate-400">
              Complete deployment automation platform for modern cloud-native applications.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/iac" className="hover:text-slate-200 transition-colors">
                  Infrastructure
                </Link>
              </li>
              <li>
                <Link href="/pipelines" className="hover:text-slate-200 transition-colors">
                  CI/CD Pipelines
                </Link>
              </li>
              <li>
                <Link href="/secrets" className="hover:text-slate-200 transition-colors">
                  Secrets Management
                </Link>
              </li>
              <li>
                <Link href="/playground" className="hover:text-slate-200 transition-colors">
                  Playground
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/guides" className="hover:text-slate-200 transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-slate-200 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-slate-200 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-200 transition-colors">
                  API Reference
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-slate-200 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-200 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-200 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-200 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-700 text-center text-sm text-slate-500">
          <p>© {currentYear} Helmify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

