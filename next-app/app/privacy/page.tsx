"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PrivacyPage() {
  // Use state and effect for dynamic data later
  useEffect(() => {
    // client-side logic placeholder
  }, []);

  return (
    <>
      

    {/**/}
    <div className="page-header">
        <div className="container">
            <h1>プライバシーポリシー</h1>
            <p>Privacy Policy</p>
        </div>
    </div>

    {/**/}
    <section className="section">
        <div className="container">
            <div className="legal-container privacy-content">
                <p>Sien（以下「当サイト」）は、お客様の個人情報の重要性を認識し、個人情報の適切な保護と管理を推進いたします。</p>

                <h3>1. 収集する情報</h3>
                <p>当サイトでは、ご依頼フォームやお問い合わせフォームの利用時に、以下の情報を収集する場合があります。</p>
                <ul>
                    <li>お名前</li>
                    <li>メールアドレス</li>
                    <li>ご依頼内容の詳細</li>
                </ul>

                <h3>2. 利用目的</h3>
                <p>収集した個人情報は、以下の目的で利用いたします。</p>
                <ul>
                    <li>サービス（ミックス／マスタリング、楽曲制作等）のご依頼受付・回答</li>
                    <li>ご連絡および納品等の業務遂行</li>
                    <li>お問い合わせへの対応</li>
                </ul>

                <h3>3. 第三者への提供</h3>
                <p>原則として、お客様の同意なく第三者に個人情報を提供することはありません。ただし、法令に基づく開示が必要な場合はこの限りではありません。</p>

                <h3>4. 安全管理措置</h3>
                <p>個人情報の漏洩、紛失、不正アクセス等を防止するため、適切な安全管理措置を講じます。</p>

                <h3>5. クッキー等の利用</h3>
                <p>当サイトでは、サービス向上のためにクッキーやアクセス解析ツールを使用することがあります。これらは個人を特定できる情報とは切り離して管理されます。</p>

                <h3>6. 開示・訂正・削除の請求</h3>
                <p>ご本人からの開示、訂正、削除等のご要望があった場合には、合理的な範囲で対応いたします。</p>

                <h3>7. お問い合わせ</h3>
                <p>個人情報に関するお問い合わせは、以下のメールアドレスまでお願いいたします。<br />
                    <a href="mailto:px.sien@gmail.com">px.sien@gmail.com</a>
                </p>

                <div className="privacy-footer mt-5" style={{ textAlign: "right", color: "#666", fontSize: "0.9em" }}>
                    <p>制定日：2026年1月<br />最終改定日：2026年1月</p>
                </div>
            </div>
        </div>
    </section>

    
    </>
  );
}
