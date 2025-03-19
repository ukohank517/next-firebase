// MEMO: フロントエンド用のfirebase関連設定

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithRedirect } from 'firebase/auth';

import { signIn as signInWithNextAuth, signOut as signOutWithNextAuth } from "next-auth/react";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email'); // googleではemailスコープ入れないとメアド取れない
const appleProvider = new OAuthProvider('apple.com');


// クライアント側で利用するfirebaseのsdk
const app = !getApps().length ? initializeApp(firebaseConfig): getApp()
export const firebaseAuth = getAuth(app);

export const redirectToGoogleLoginPage = async () => {
  googleProvider.setCustomParameters({
    prompt: 'select_account',
    hl: "ja" // 言語指定はここで行う(ja, en)
  });

  setRedirectUri("/mypage?hoge=fuga");
  signInWithRedirect(firebaseAuth, googleProvider);
}

export const redirectToAppleRedirectPage = async () => {
  appleProvider.setCustomParameters({
    locale: "ja", // Apple用の言語指定(ja, en)
  });

  setRedirectUri("/mypage?hoge=fuga");
  signInWithRedirect(firebaseAuth, appleProvider);
}

// ログイン後のセッションをnext-authに渡す
export const loginAccount = async (idToken: string, refreshToken: string, redirectUtl: string) => {
  await signInWithNextAuth('credentials', {
    idToken,
    refreshToken,
    callbackUrl: redirectUtl
  })
}

// ログアウト処理, セッションも削除
export const logoutAccount = async (): Promise<boolean> => {
  try {
    await firebaseAuth.signOut().then(() => {
      signOutWithNextAuth({ callbackUrl: '/' });
    });
    return true;
  } catch (error) {
    console.error(error);
    return false
  }
}

// google, appleに関しては、ログイン後のリダイレクト先をセッションストレージに保存する処理
// ログイン後のリダイレクト先をセッションストレージに保存する処理
const LOGIN_REDIRECT_PARAM = 'loginRedirectUri'
export const setRedirectUri = (uri: string) => {
  sessionStorage.setItem(LOGIN_REDIRECT_PARAM, uri)
}
export const getRedirectUri = () => {
  const result = sessionStorage.getItem(LOGIN_REDIRECT_PARAM)
  sessionStorage.removeItem(LOGIN_REDIRECT_PARAM)
  return result
}

