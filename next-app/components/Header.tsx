"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="logo">
        <Link href="/">
          <img src="/assets/logo.png" alt="SIEN.OFFICIAL" />
        </Link>
      </div>
      <input type="checkbox" id="nav-toggle" className="nav-toggle" />
      <label htmlFor="nav-toggle" className="nav-toggle-label">
        <span></span>
      </label>
      <nav className="nav-menu">
        <ul>
          <li>
            <Link href="/mix" className={pathname === "/mix" ? "active-link" : ""}>
              ミックス／マスタリング
            </Link>
          </li>
          <li>
            <Link href="/original" className={pathname === "/original" ? "active-link" : ""}>
              オリジナル楽曲制作
            </Link>
          </li>
          <li>
            <Link href="/works" className={pathname === "/works" ? "active-link" : ""}>
              制作実績
            </Link>
          </li>
          <li>
            <Link href="/order" className="nav-cta">
              ご依頼フォーム
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
