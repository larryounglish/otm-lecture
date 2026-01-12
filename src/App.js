import React, { useState, useEffect } from 'react';
import { Play, Lock, CheckCircle, LogOut } from 'lucide-react';
import { auth, signInWithGoogle, signInWithKakao, checkPurchase, signOut as firebaseSignOut } from './firebase';
import { requestPayment } from './payment';
import { onAuthStateChanged } from 'firebase/auth';

const LecturePlatform = () => {
  const [user, setUser] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  const LECTURE_ID = 'otm-english-2025';

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
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header style={{ backgroundColor: '#000', borderBottom: '1px solid #374151' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>OTM</div>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#9ca3af' }}>CSAT ENGLISH LAB</div>
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#d1d5db' }}>{user.displayName || user.email}님</span>
              <button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '3rem 1rem' }}>
        {!user && (
          <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
              <div style={{ aspectRatio: '16/9', background: 'linear-gradient(to bottom right, #1f2937, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play style={{ color: 'white', width: '5rem', height: '5rem', opacity: 0.6 }} />
              </div>
              <div style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>시대인재 오택민 수능영어</h2>
                <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.625' }}>
                  안정적인 1등급을 위해 필수적인 빈칸/순서/삽입에 대한 명확한 풀이 기준을 알려드립니다.
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000' }}>90분</div>
                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>강의 시간</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000' }}>평생</div>
                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>무제한 시청</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000' }}>HD</div>
                    <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>고화질</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <span style={{ color: '#9ca3af', textDecoration: 'line-through', fontSize: '1.125rem' }}>₩79,000</span>
                    <span style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#000' }}>₩39,000</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem', color: '#111827' }}>
                간편하게 시작하기
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={handleKakaoLogin}
                  disabled={isProcessing}
                  style={{ width: '100%', backgroundColor: '#FEE500', color: '#000000', fontWeight: '600', padding: '1rem', borderRadius: '0.5rem', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', opacity: isProcessing ? 0.5 : 1 }}
                >
                  <span style={{ fontSize: '1.25rem' }}>K</span>
                  {isProcessing ? '로그인 중...' : '카카오로 시작하기'}
                </button>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isProcessing}
                  style={{ width: '100%', backgroundColor: 'white', color: '#111827', fontWeight: '600', padding: '1rem', borderRadius: '0.5rem', border: '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', opacity: isProcessing ? 0.5 : 1 }}
                >
                  <span style={{ fontSize: '1.25rem' }}>G</span>
                  {isProcessing ? '로그인 중...' : 'Google로 시작하기'}
                </button>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginTop: '1.5rem' }}>
                가입 시 이용약관 및 개인정보처리방침에 동의하게 됩니다
              </p>
            </div>
          </div>
        )}

        {user && !hasPurchased && (
          <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid #e5e7eb' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', backgroundColor: '#f3f4f6', borderRadius: '9999px', marginBottom: '1rem' }}>
                  <Lock style={{ color: '#1f2937' }} size={32} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>강의를 구매하고 시청하세요</h2>
                <p style={{ color: '#4b5563' }}>
                  단 한 번의 결제로 평생 시청 가능합니다
                </p>
              </div>

              <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: '600', color: '#111827' }}>시대인재 오택민 수능영어</span>
                  <span style={{ color: '#9ca3af', textDecoration: 'line-through' }}>₩79,000</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  <span style={{ color: '#111827' }}>최종 결제 금액</span>
                  <span style={{ color: '#000' }}>₩49,000</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                style={{ width: '100%', backgroundColor: '#000', color: 'white', fontWeight: 'bold', padding: '1.25rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '1.125rem', opacity: isProcessing ? 0.5 : 1 }}
              >
                카드 / 간편결제로 구매하기
              </button>

              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <CheckCircle style={{ color: '#374151', flexShrink: 0, marginTop: '2px' }} size={20} />
                  <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                    <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>안심 구매 보장</p>
                    <p style={{ color: '#4b5563' }}>
                      7일 이내 콘텐츠가 마음에 들지 않으면 100% 환불해드립니다
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {user && hasPurchased && (
          <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe 
                  src="https://player.vimeo.com/video/1153490030?badge=0&autopause=0&player_id=0&app_id=58479" 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  frameBorder="0" 
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="시대인재 오택민 수능영어"
                />
              </div>

              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>시대인재 오택민 수능영어</h2>
                    <p style={{ color: '#4b5563' }}>
                      안정적인 1등급을 위해 필수적인 빈칸/순서/삽입에 대한 명확한 풀이 기준을 알려드립니다
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f3f4f6', color: '#1f2937', padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid #d1d5db' }}>
                    <CheckCircle size={20} />
                    <span style={{ fontWeight: '600' }}>구매 완료</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '1rem', color: '#111827' }}>강의 커리큘럼</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      '01. 빈칸추론 완벽 공략법',
                      '02. 순서배열 정확한 풀이 기준',
                      '03. 문장삽입 핵심 전략',
                      '04. 실전 문제풀이 연습',
                      '05. 1등급 확정 마무리'
                    ].map((chapter, idx) => (
                      <div 
                        key={idx}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', cursor: 'pointer', border: '1px solid #e5e7eb' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2rem', height: '2rem', backgroundColor: '#000', color: 'white', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                          {idx + 1}
                        </div>
                        <span style={{ fontWeight: '500', color: '#111827' }}>{chapter}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#6b7280' }}>18분</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ backgroundColor: '#000', color: '#9ca3af', marginTop: '5rem', padding: '2rem', borderTop: '1px solid #374151' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <p>© 2025 CSAT English Lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LecturePlatform;