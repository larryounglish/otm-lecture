import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { auth, signInWithGoogle, signInWithKakao, checkPurchase, signOut as firebaseSignOut } from './firebase';
import { requestPayment } from './payment';
import { onAuthStateChanged } from 'firebase/auth';

const LecturePlatform = () => {
  const [user, setUser] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const LECTURE_ID = 'otm-english-2025';

  // 인앱 브라우저 감지
  const isInAppBrowser = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /KAKAOTALK|NAVER|Line|Instagram|FB_IAB|FBAN|FBAV|Twitter|WhatsApp|Snapchat/i.test(ua);
  };

  const showGoogleLogin = !isInAppBrowser();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const purchased = await checkPurchase(currentUser.uid, LECTURE_ID);
        setHasPurchased(purchased);
      } else {
        setUser(null);
        setHasPurchased(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인에 실패했습니다: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKakaoLogin = async () => {
    setIsProcessing(true);
    try {
      const kakaoUser = await signInWithKakao();
      setUser(kakaoUser);
      const purchased = await checkPurchase(kakaoUser.uid, LECTURE_ID);
      setHasPurchased(purchased);
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      alert('카카오 로그인에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    requestPayment(
      user,
      () => {
        setHasPurchased(true);
        alert('✅ 결제가 완료되었습니다! 이제 강의를 시청하실 수 있습니다.');
      },
      (errorMsg) => {
        alert('결제 실패: ' + errorMsg);
      }
    );
  };

  const handleLogout = async () => {
    await firebaseSignOut();
    setUser(null);
    setHasPurchased(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: '300', color: '#000', letterSpacing: '0.2em' }}>로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* 헤더 */}
      <header style={{ borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.05em', color: '#000' }}>OTM</span>
              <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '0.5rem', letterSpacing: '0.1em' }}>CSAT ENGLISH LAB</span>
            </div>
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>{user.displayName || user.email}님</span>
              <button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* 비로그인 상태 - 제품 소개 */}
        {!user && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
            <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
              {/* 좌측 이미지 영역 */}
              <div style={{ backgroundColor: '#000', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '500px' }}>
                <img src="/otm-logo.png" alt="OTM Logo" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
              </div>
              
              {/* 우측 정보 영역 */}
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '600', color: '#000', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                  시대인재 오택민 수능영어
                </h1>
                <p style={{ fontSize: '1rem', color: '#666', marginBottom: '2.5rem', lineHeight: '1.8' }}>
                  안정적인 1등급을 위해 필수적인 빈칸/순서/삽입에 대한 명확한 풀이 기준을 알려드립니다.
                </p>

                <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '2rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '3rem', marginBottom: '2rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>강의 시간</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#000' }}>90분</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>시청 기간</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#000' }}>무제한</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>화질</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#000' }}>HD</div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '2rem', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1rem', color: '#999', textDecoration: 'line-through' }}>99,000원</span>
                    <span style={{ fontSize: '1.75rem', fontWeight: '600', color: '#000' }}>44,900원</span>
                    <span style={{ backgroundColor: '#000', color: '#fff', fontSize: '0.875rem', fontWeight: '600', padding: '0.25rem 0.625rem', borderRadius: '2px' }}>55%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button
                    onClick={handleKakaoLogin}
                    disabled={isProcessing}
                    style={{ 
                      width: '100%', 
                      backgroundColor: '#FEE500', 
                      color: '#000', 
                      fontWeight: '500', 
                      padding: '1rem', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: '0.9375rem',
                      opacity: isProcessing ? 0.5 : 1,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    {isProcessing ? '로그인 중...' : '카카오로 시작하기'}
                  </button>

                  {showGoogleLogin && (
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isProcessing}
                      style={{ 
                        width: '100%', 
                        backgroundColor: '#fff', 
                        color: '#000', 
                        fontWeight: '500', 
                        padding: '1rem', 
                        border: '1px solid #e5e5e5', 
                        cursor: 'pointer', 
                        fontSize: '0.9375rem',
                        opacity: isProcessing ? 0.5 : 1,
                        transition: 'opacity 0.2s'
                      }}
                    >
                      {isProcessing ? '로그인 중...' : 'Google로 시작하기'}
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '1.5rem' }}>
                  가입 시 이용약관 및 개인정보처리방침에 동의하게 됩니다
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 로그인 후 미구매 상태 - 결제 페이지 */}
        {user && !hasPurchased && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
            <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
              {/* 좌측 이미지 영역 */}
              <div className="image-section" style={{ backgroundColor: '#000', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '500px', position: 'sticky', top: '2rem' }}>
                <img src="/otm-logo.png" alt="OTM Logo" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
              </div>
              
              {/* 우측 결제 영역 */}
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '600', color: '#000', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                  시대인재 오택민 수능영어
                </h1>
                <p style={{ fontSize: '0.9375rem', color: '#666', marginBottom: '2.5rem' }}>
                  안정적인 1등급을 위한 필수 강의
                </p>

                <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '2rem' }}>
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ color: '#333' }}>시대인재 오택민 수능영어</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#999', textDecoration: 'line-through', fontSize: '0.875rem' }}>99,000원</span>
                        <span style={{ fontWeight: '600', color: '#000' }}>44,900원</span>
                        <span style={{ backgroundColor: '#000', color: '#fff', fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.5rem', borderRadius: '2px' }}>55%</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '1rem', color: '#000' }}>총 결제 금액</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '600', color: '#000' }}>44,900원</span>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    style={{ 
                      width: '100%', 
                      backgroundColor: '#000', 
                      color: '#fff', 
                      fontWeight: '500', 
                      padding: '1.125rem', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: '0.9375rem',
                      opacity: isProcessing ? 0.5 : 1,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    구매하기
                  </button>

                  <div style={{ marginTop: '2rem', padding: '1.25rem', backgroundColor: '#f9f9f9' }}>
                    <p style={{ fontSize: '0.8125rem', color: '#666', lineHeight: '1.7' }}>
                      ※ 구매 후 즉시 시청 가능합니다<br />
                      ※ PDF 파일과 영상이 모두 제공되므로 환불이 되지 않습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 구매 완료 상태 - 강의 시청 */}
        {user && hasPurchased && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
            <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
              {/* 좌측 비디오 영역 */}
              <div>
                <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
                  <iframe 
                    src="https://player.vimeo.com/video/1153490030?badge=0&autopause=0&player_id=0&app_id=58479" 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    frameBorder="0" 
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin"
                    title="시대인재 오택민 수능영어"
                  />
                </div>
              </div>
              
              {/* 우측 정보 영역 */}
              <div>
                <div style={{ display: 'inline-block', padding: '0.375rem 0.75rem', backgroundColor: '#f0f0f0', fontSize: '0.75rem', color: '#666', marginBottom: '1rem' }}>
                  구매 완료
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: '600', color: '#000', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                  시대인재 오택민 수능영어
                </h1>
                <p style={{ fontSize: '0.9375rem', color: '#666', marginBottom: '2.5rem', lineHeight: '1.8' }}>
                  안정적인 1등급을 위해 필수적인 빈칸/순서/삽입에 대한 명확한 풀이 기준을 알려드립니다.
                </p>

                <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '2rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#000', marginBottom: '1.5rem' }}>강의 자료</h2>
                  <a 
                    href="/lecture-material.pdf" 
                    download
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '1.25rem 1.5rem', 
                      backgroundColor: '#f9f9f9',
                      border: '1px solid #e5e5e5',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>📄</span>
                      <span style={{ fontSize: '0.9375rem', color: '#000', fontWeight: '500' }}>강의 자료 PDF 다운로드</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#666' }}>↓</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer style={{ borderTop: '1px solid #e5e5e5', marginTop: '6rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: '#999' }}>© 2025 OTM CSAT English Lab. All rights reserved.</p>
        </div>
      </footer>

      {/* 모바일 대응 스타일 */}
      <style>{`
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .image-section {
            max-height: 300px !important;
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LecturePlatform;
