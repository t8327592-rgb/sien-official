"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [works, setWorks] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    // Background Video Slider
    const bgVideos = document.querySelectorAll('.video-slide');
    if (bgVideos.length > 1) {
        let currentVidIdx = 0;
        const interval = setInterval(() => {
            bgVideos[currentVidIdx]?.classList.remove('active');
            currentVidIdx = (currentVidIdx + 1) % bgVideos.length;
            bgVideos[currentVidIdx]?.classList.add('active');
        }, 7000);
        return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // Fetch Public Data
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin?type=public'); // Needs api implementation later
        if (res.ok) {
          const data = await res.json();
          if (data.works) setWorks(data.works.slice(0, 3));
          if (data.newsList) setNews(data.newsList.slice(0, 3));
        }
      } catch (e) {
        console.error("Failed to fetch top data", e);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-video-bg">
          <div className="video-slide active" id="bg-vid-1">
            <iframe
              src="https://www.youtube.com/embed/zTxvMNXaFoA?autoplay=1&mute=1&controls=0&loop=1&playlist=zTxvMNXaFoA&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
          <div className="video-slide" id="bg-vid-2">
            <iframe
              src="https://www.youtube.com/embed/Rc531IszCes?autoplay=1&mute=1&controls=0&loop=1&playlist=Rc531IszCes&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
          <div className="video-slide" id="bg-vid-3">
            <iframe
              src="https://www.youtube.com/embed/Ke1HAX8Z49I?autoplay=1&mute=1&controls=0&loop=1&playlist=Ke1HAX8Z49I&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-container">
          <h1 className="fade-in">
            あなたの歌を<span className="accent-text">“伝わる歌”へ</span>
          </h1>
          <p className="hero-sub fade-in delay-1">
            歌ってみたもオリジナルも<br />
            迫力と臨場感のあるサウンドで
          </p>
        </div>
      </section>

      <section id="purpose" className="section bg-light-blue">
        <div className="container">
          <h2 className="section-title">目的から探す</h2>
          <div className="purpose-grid">
            <Link
              href="/mix"
              className="purpose-card text-center"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <div style={{ fontSize: "3rem", color: "var(--accent-blue)", marginBottom: "20px" }}>
                <i className="fa-solid fa-sliders"></i>
              </div>
              <h3>ミックス／マスタリング</h3>
              <p className="price-desc" style={{ marginTop: "15px", marginBottom: "25px" }}>
                歌ってみた等のボーカルミックス。<br />
                ピッチ補正からマスタリングまで対応。
              </p>
              <div className="btn btn-primary" style={{ marginTop: "auto", width: "100%" }}>
                詳細を見る
              </div>
            </Link>
            <Link
              href="/original"
              className="purpose-card text-center"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <div style={{ fontSize: "3rem", color: "var(--accent-blue)", marginBottom: "20px" }}>
                <i className="fa-solid fa-music"></i>
              </div>
              <h3>オリジナル楽曲制作</h3>
              <p className="price-desc" style={{ marginTop: "15px", marginBottom: "25px" }}>
                あなただけの完全オリジナル楽曲制作。<br />
                作曲・編曲から納品までトータルサポート。
              </p>
              <div className="btn btn-primary" style={{ marginTop: "auto", width: "100%" }}>
                詳細を見る
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="section">
        <div className="container text-center">
          <div className="profile-card">
            <div className="profile-img-container">
              <img src="/assets/profile.jpg" alt="Sien Profile" className="profile-photo" />
            </div>
            <h3>
              しえん <span className="job-title">／ ミックスエンジニア・作曲家</span>
            </h3>
            <p className="profile-desc">
              ミックス／マスタリング、オリジナル楽曲制作を提供しています。<br />
              迫力と臨場感のあるサウンド作りを得意とし、いただいた音源を最高にカッコよく仕上げます。<br />
              個人の方もお気軽にご相談ください。
            </p>

            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">総制作数</span>
                <span className="stat-num">800+</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">主要取引先</span>
                <span className="stat-text">アマル / ぷりっつ / こーく-不透明- / 深淵組 / re;BON ...etc</span>
              </div>
            </div>

            <div className="profile-btns">
              <Link href="/order" className="btn btn-primary">
                お見積もり・相談する
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="equipment" className="section">
        <div className="container">
          <h2 className="section-title">こだわり・使用機材</h2>
          <div className="eq-grid">
            <div className="eq-item">
              <div className="eq-icon">
                <i className="fa-solid fa-sliders"></i>
              </div>
              <h3>丁寧な音作り</h3>
              <p>歌声の魅力がしっかり伝わるよう、細部まで整えた自然な仕上がりを行います。</p>
            </div>
            <div className="eq-item">
              <div className="eq-icon">
                <i className="fa-solid fa-microchip"></i>
              </div>
              <h3>クリアで聴きやすい音質</h3>
              <p>ノイズを抑え、音程も自然に調整。長時間聴いても疲れにくい音に仕上げます。</p>
            </div>
            <div className="eq-item">
              <div className="eq-icon">
                <i className="fa-solid fa-headphones-simple"></i>
              </div>
              <h3>どんな環境でも安定した音</h3>
              <p>スマホからスピーカーまで、再生環境が変わってもバランスの良い音を目指します。</p>
            </div>
          </div>
        </div>
      </section>

      <section id="works" className="section">
        <div className="container">
          <h2 className="section-title">制作実績</h2>
          <div id="works-grid" className="video-grid">
            {works.length > 0 ? (
              works.map((w: any, idx: number) => (
                <div key={idx} className="work-item">
                  <div className="video-container">
                    <iframe src={`https://www.youtube.com/embed/${w.id}`} frameBorder="0" allowFullScreen></iframe>
                  </div>
                  <p className="work-title" style={{ marginBottom: "5px" }}>{w.title}</p>
                  <p className="work-role" style={{ fontSize: "0.8rem", color: "#666", padding: "0 15px 15px", marginTop: "auto" }}>ミックス／マスタリング</p>
                </div>
              ))
            ) : (
              <p>読み込み中...</p>
            )}
          </div>

          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link href="/works" className="view-all">
                すべての実績を見る <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="text-center mt-5">
            <Link href="/order" className="btn btn-primary btn-lg">
              お見積もり・相談する
            </Link>
          </div>
        </div>
      </section>

      <section id="voices" className="section">
        <div className="container">
          <h2 className="section-title">ご依頼者様の声</h2>
          <div className="voices-grid">
            <div className="voice-card">
              <div className="voice-icon"><i className="fa-solid fa-star"></i></div>
              <h3 className="voice-title">魔法のような仕上がりに感動しました</h3>
              <p className="voice-text">声の不快な部分が無くなるのが魔法すぎて感動しています！</p>
            </div>
            <div className="voice-card">
              <div className="voice-icon"><i className="fa-solid fa-quote-left"></i></div>
              <h3 className="voice-title">理想以上のクオリティと丁寧なMIX</h3>
              <p className="voice-text">ボーカルの輪郭がしっかりしていて、パンのバランスも最高です！</p>
            </div>
          </div>
        </div>
      </section>

      <section id="news" className="section">
        <div className="container">
          <div className="news-container">
            <div className="news-header">
              <h2 className="section-title text-left">お知らせ</h2>
            </div>
            <div className="news-content">
              <ul className="news-list" id="top-news-list">
                {news.length > 0 ? (
                  news.map((n: any, idx: number) => (
                    <li key={idx}>
                      <span className="news-date">{new Date(n.date).toLocaleDateString()}</span>
                      <Link href={`/news/${n.id}`} className="news-title">{n.title}</Link>
                    </li>
                  ))
                ) : (
                  <li style={{ textAlign: "center", padding: "20px", color: "#999", border: "none" }}>読み込み中...</li>
                )}
              </ul>
              <div className="news-more" style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                <Link href="/news" className="view-all">
                  一覧を見る <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
