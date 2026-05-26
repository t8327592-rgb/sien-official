"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WorksPage() {
  // Use state and effect for dynamic data later
  useEffect(() => {
    // client-side logic placeholder
  }, []);

  return (
    <>
      

    {/**/}
    <div className="page-header">
        <div className="container">
            <h1>制作実績</h1>
            <p>これまでに手掛けた作品の一部をご紹介します。</p>
        </div>
    </div>

    {/**/}
    <section className="section">
        <div className="container">

            {/**/}
            <div className="works-tabs text-center mb-5">
                <button className="tab-btn active" data-tab="all">すべて</button>
                <button className="tab-btn" data-tab="mix">ミックス／マスタリング</button>
                <button className="tab-btn" data-tab="original">オリジナル楽曲制作</button>
            </div>

            {/**/}
            <div className="works-category mb-5" id="category-mix">
                <h2 className="section-title">ミックス／マスタリング</h2>
                <div className="video-grid" id="works-mix-container">
                    {/**/}
                </div>
            </div>

            {/**/}
            <div style={{ height: "60px" }} id="works-separator"></div>

            {/**/}
            <div className="works-category" id="category-original">
                <h2 className="section-title">オリジナル楽曲制作</h2>
                <div className="video-grid" id="works-original-container">
                    {/**/}
                </div>
            </div>

            <div className="text-center mt-5">
                <a href="order.html" className="btn btn-primary btn-lg">お見積もり・相談する</a>
            </div>

        </div>
    </section>

    
    </>
  );
}
