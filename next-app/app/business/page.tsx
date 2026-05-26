"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BusinessPage() {
  // Use state and effect for dynamic data later
  useEffect(() => {
    // client-side logic placeholder
  }, []);

  return (
    <>
      

    {/**/}
    <div className="page-header">
        <div className="container">
            <h1>法人・企業様お問い合わせ</h1>
            <p>For Business</p>
        </div>
    </div>

    {/**/}
    <section className="section">
        <div className="container">

            {/**/}
            <div id="input-area">
                <p className="text-center" style={{ marginBottom: "40px" }}>
                    制作のご依頼、イベント出演、その他ビジネスに関するお問い合わせはこちらからお願いいたします。<br />
                    原則24時間以内にご返信させていただきます。
                </p>

                {/**/}
                <form id="businessForm" className="order-form-clean" action="" method="POST">
                    <input type="hidden" name="form-name" value="business" />

                    {/**/}
                    <div className="form-grid">

                        {/**/}
                        <div className="form-group">
                            <label>貴社名 <span className="req">必須</span></label>
                            <input type="text" name="貴社名" required placeholder="例: 株式会社○○" />
                        </div>

                        {/**/}
                        <div className="form-group">
                            <label>ご担当者様名 <span className="req">必須</span></label>
                            <input type="text" name="ご担当者様名" required placeholder="例: 山田 太郎" />
                        </div>

                        {/**/}
                        <div className="form-group">
                            <label>メールアドレス <span className="req">必須</span></label>
                            <input type="email" name="メールアドレス" required placeholder="example@company.co.jp" />
                        </div>

                        {/**/}
                        <div className="form-group">
                            <label>ご依頼種別 <span className="req">必須</span></label>
                            <select name="ご依頼種別" required>
                                <option value="">選択してください</option>
                                <option value="ミックス／マスタリング">ミックス／マスタリング</option>
                                <option value="オリジナル楽曲制作">オリジナル楽曲制作</option>
                            </select>
                        </div>

                        {/**/}
                        <div className="form-group">
                            <label>ご予算感 <span className="req">必須</span></label>
                            <input type="text" name="ご予算感" required placeholder="例: 10万円〜" />
                        </div>

                        {/**/}
                        <div className="form-group full-width">
                            <label>お問い合わせ内容 <span className="req">必須</span></label>
                            <textarea name="お問い合わせ内容" required placeholder="ご依頼の詳細、スケジュール感などをご記入ください"
                                style={{ minHeight: "200px" }}></textarea>
                        </div>

                    </div>

                    {/**/}
                    <div className="form-group checkbox-group mt-4" style={{ textAlign: "center" }}>
                        <input type="checkbox" id="agree" required
                            style={{ width: "auto", marginRight: "10px", transform: "scale(1.2)" }} />
                        <label htmlFor="agree" style={{ display: "inline", fontSize: "1rem", cursor: "pointer" }}>
                            <a href="terms.html" target="_blank" className="disclaimer-link"
                                style={{ color: "#2563eb", textDecoration: "underline" }}>ご依頼に関する留意事項</a>に同意する <span
                                className="req">*</span>
                        </label>
                    </div>

                    <div className="text-center mt-5">
                        <button type="submit" className="btn btn-primary btn-lg" style={{ minWidth: "250px" }}>
                            送信する <i className="fa-solid fa-paper-plane ml-2"></i>
                        </button>
                    </div>
                </form>
            </div>

            <div id="successMessage" className="success-message hidden">
                <i className="fa-regular fa-paper-plane"></i>
                <h3>送信完了</h3>
                <p>お問い合わせありがとうございます。<br />内容を確認のうえ、担当者よりご連絡させていただきます。</p>
                <div className="text-center mt-4">
                    <a href="index.html" className="btn btn-outline">ホームに戻る</a>
                </div>
            </div>
        </div>
    </section>

    
    </>
  );
}
