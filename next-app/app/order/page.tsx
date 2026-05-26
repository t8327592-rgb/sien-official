"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrderPage() {
  // Use state and effect for dynamic data later
  useEffect(() => {
    // client-side logic placeholder
  }, []);

  return (
    <>
      

    {/**/}
    <div className="page-header">
        <div className="container">
            <h1>ご依頼フォーム</h1>
            <p>お見積もりは無料です。原則24時間以内にメールにて返信いたします。</p>
        </div>
    </div>

    {/**/}
    <section className="section">
        <div className="container">

            {/**/}
            <div id="input-area">
                <div className="order-status text-center">
                    <span className="status-open" id="order-status-display"></span>
                </div>

                {/**/}
                <div className="text-center mb-5" style={{ marginBottom: "60px" }}>
                    <a href="business.html" className="btn btn-outline btn-sm"
                        style={{ borderRadius: "30px", fontWeight: "500" }}>
                        <i className="fa-solid fa-briefcase"></i> 法人・企業様のお問い合わせはこちら
                    </a>
                </div>

                {/**/}
                <div id="notices-container"></div>

                {/**/}
                <form id="orderForm" className="order-form-clean" action="" method="POST">
                    <input type="hidden" name="form-name" value="contact" />

                    {/**/}
                    <div className="form-grid">

                        {/**/}
                        <h3 className="form-section-title">【① 基本情報】</h3>

                        {/**/}
                        <div className="form-group">
                            <label>活動名 / お名前 <span className="req">必須</span></label>
                            <input type="text" name="ご依頼者名" required placeholder="活動名を入力" />
                        </div>

                        {/**/}
                        <div className="form-group">
                            <label>メールアドレス <span className="req">必須</span></label>
                            <input type="email" name="メールアドレス" required placeholder="example@email.com" />
                        </div>

                        {/**/}
                        <div className="form-group">
                            <label>Twitter ID <span className="req">必須</span></label>
                            <input type="text" name="TwitterID(任意)" required placeholder="@sien_mc09" />
                        </div>

                        {/**/}
                        <div className="form-group">
                            <label>希望する連絡手段 <span className="req">必須</span></label>
                            <select name="希望する連絡手段" required>
                                <option value="">選択してください</option>
                                <option value="twitter_dm">Twitter DM</option>
                                <option value="email">メール</option>
                            </select>
                        </div>

                        {/**/}
                        <h3 className="form-section-title">【② ご依頼内容】</h3>

                        {/**/}
                        <div className="form-group">
                            <label>プランを選択してください <span className="req">必須</span></label>
                            <select name="プラン" id="plan" required>
                                <option value="">選択してください</option>
                                <option value="std">スタンダードプラン</option>
                                <option value="chorus">ワンコーラスプラン</option>
                                <option value="short">ショート動画用MIX</option>
                                <option value="speed">短納期プラン</option>
                                <option value="superspeed">最短納期プラン</option>
                                <option value="collab">コラボ・合唱プラン</option>
                                <option value="orig_std">完パケプラン</option>
                                <option value="orig_lyric">作詞持ち込みプラン</option>
                                <option value="other">その他・ご相談</option>
                            </select>
                        </div>

                        {/**/}
                        <div className="form-group full-width">
                            <label>曲名 (ない場合は"なし"と入力) <span className="req">必須</span></label>
                            <input type="text" name="曲名" required placeholder="例: モニタリング / なし" />
                        </div>

                        {/**/}
                        <div className="form-group">
                            <label>オプション / その他</label>
                            <input type="text" name="オプション" placeholder="ボーカルガイド、カットアップ、エンコードなど" />
                        </div>

                        {/**/}
                        <h3 className="form-section-title">【③ 楽曲情報】</h3>

                        {/**/}
                        <div className="form-group">
                            <label>歌唱キー <span className="req">必須</span></label>
                            <select name="キー変更" required>
                                <option value="">選択してください</option>
                                <option value="0">原キー (±0)</option>
                                <option value="+1">+1</option>
                                <option value="+2">+2</option>
                                <option value="+3">+3</option>
                                <option value="+4">+4</option>
                                <option value="+5">+5</option>
                                <option value="+6">+6</option>
                                <option value="+7">+7</option>
                                <option value="-1">-1</option>
                                <option value="-2">-2</option>
                                <option value="-3">-3</option>
                                <option value="-4">-4</option>
                                <option value="-5">-5</option>
                                <option value="-6">-6</option>
                                <option value="-7">-7</option>
                            </select>
                        </div>

                        {/**/}
                        <div className="form-group">
                            <label>参考曲 (YouTubeなどのURL)</label>
                            <input type="url" name="参考URL(任意)" placeholder="https://..." />
                        </div>

                        {/**/}
                        <h3 className="form-section-title">【④ 素材提出】</h3>

                        {/**/}
                        <div className="form-group full-width">
                            <label>レコーディング済み音源のアップロードURL</label>
                            <input type="url" name="レコーディング済み音源" placeholder="Gigafile便、Google DriveなどのURL" />
                            <p className="form-note" style={{ fontSize: "0.9em", color: "#aaa", marginTop: "5px" }}>
                                ※音源が未提出の場合でもご依頼可能です。</p>
                        </div>

                        {/**/}
                        <h3 className="form-section-title">【⑤ お支払い方法】</h3>

                        {/**/}
                        <div className="form-group">
                            <label>お支払い方法 <span className="req">必須</span></label>
                            <select name="お支払い方法" required>
                                <option value="">選択してください</option>
                                <option value="bank_transfer">銀行振込</option>
                                <option value="credit_card">クレジットカード</option>
                            </select>
                        </div>

                        {/**/}
                        <h3 className="form-section-title">【⑥ 自由記述】</h3>

                        {/**/}
                        <div className="form-group full-width">
                            <label>ご要望・ご質問・特記事項など</label>
                            <textarea name="ご要望・ご質問・特記事項など" placeholder="ご自由にご記入ください"></textarea>
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
                            無料で内容を相談する <i className="fa-solid fa-paper-plane ml-2"></i>
                        </button>
                        <p style={{ marginTop: "10px", fontSize: "0.9rem", color: "#666" }}>最短24時間以内に返信いたします</p>
                    </div>
                </form>
            </div>

            <div id="successMessage" className="success-message hidden">
                <i className="fa-regular fa-paper-plane"></i>
                <h3>送信完了</h3>
                <p>送信が完了しました。<br />この度はご依頼いただき、誠にありがとうございます。<br /><br />内容を確認のうえ、24時間以内にご連絡させていただきます。</p>
            </div>
        </div>
    </section>

    
    </>
  );
}
