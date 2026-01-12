import { savePurchase } from './firebase';

export const requestPayment = (user, onSuccess, onFail) => {
  const IMP = window.IMP;
  IMP.init('imp44277082'); // 여기에 받은 식별코드!
  
  IMP.request_pay({
    pg: 'kakaopay.TC0ONETIME', // 테스트용
    pay_method: 'card',
    merchant_uid: `order_${new Date().getTime()}_${user.uid}`,
    name: '시대인재 오택민 수능영어',
    amount: 49000,
    buyer_email: user.email,
    buyer_name: user.displayName || '구매자',
    buyer_tel: '010-0000-0000',
  }, async (rsp) => {
    if (rsp.success) {
      console.log('결제 성공:', rsp);
      
      try {
        await savePurchase(user.uid, 'otm-english-2025', {
          imp_uid: rsp.imp_uid,
          merchant_uid: rsp.merchant_uid,
          paid_amount: rsp.paid_amount,
          pay_method: rsp.pay_method,
        });
        
        onSuccess();
      } catch (error) {
        console.error('구매 정보 저장 실패:', error);
        onFail('구매 정보 저장에 실패했습니다.');
      }
    } else {
      console.log('결제 실패:', rsp);
      onFail(rsp.error_msg);
    }
  });
};