import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// 여기에 아까 받은 Firebase 설정 코드 붙여넣기
const firebaseConfig = {
  apiKey: "AIzaSyBUur59_Dh9uYcOAcgR7AM0NosxJ6icNZs",
  authDomain: "otm-lecture.firebaseapp.com",
  projectId: "otm-lecture",
  storageBucket: "otm-lecture.firebasestorage.app",
  messagingSenderId: "822536141000",
  appId: "1:822536141000:web:ab40f9a24694e2071d8dfd"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google 로그인
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// 구매 정보 저장
export const savePurchase = async (userId, lectureId, paymentData) => {
  const purchaseRef = doc(db, 'purchases', `${userId}_${lectureId}`);
  await setDoc(purchaseRef, {
    userId,
    lectureId,
    ...paymentData,
    purchaseDate: new Date().toISOString(),
    status: 'completed'
  });
};

// 구매 여부 확인
export const checkPurchase = async (userId, lectureId) => {
  const purchaseRef = doc(db, 'purchases', `${userId}_${lectureId}`);
  const purchaseSnap = await getDoc(purchaseRef);
  return purchaseSnap.exists();
};

// 로그아웃
export const signOut = async () => {
  await auth.signOut();
};
export const signInWithKakao = () => {
  return new Promise((resolve, reject) => {
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init('869230ee7e7d5467001436fefaa71938');
    }
    
    window.Kakao.Auth.login({
      success: function(authObj) {
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: function(res) {
            const user = {
              uid: 'kakao_' + res.id,
              email: res.kakao_account?.email || '',
              displayName: res.properties?.nickname || '카카오 사용자',
              provider: 'kakao'
            };
            resolve(user);
          },
          fail: function(error) {
            reject(error);
          }
        });
      },
      fail: function(err) {
        reject(err);
      }
    });
  });
};