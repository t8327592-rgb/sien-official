"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NewsPage() {
  // Use state and effect for dynamic data later
  useEffect(() => {
    // client-side logic placeholder
  }, []);

  return (
    <>
      

    {/**/}
    <div className="page-header">
        <div className="container">
            <h1>お知らせ</h1>
            <p>お知らせ</p>
        </div>
    </div>

    {/**/}
    <section className="section">
        <div className="container">
                <div id="public-news-list">
                    <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>読み込み中...</p>
                </div>

            <div className="text-center mt-5">
                <a href="index.html" className="btn btn-outline">ホームに戻る</a>
            </div>
        </div>
    </section>

    
    </>
  );
}
