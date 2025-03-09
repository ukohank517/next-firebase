// MEMO: フロントエンド用のfirebase関連設定

import { CreateToasterReturn } from '@chakra-ui/react';
import { getApp, getApps, initializeApp } from "firebase/app";

import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithRedirect } from 'firebase/auth';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { signOut as signOutWithNextAuth } from "next-auth/react";


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
const appleProvider = new OAuthProvider('apple.com');


// クライアント側で利用するfirebaseのsdk
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig): getApp()
// export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const handleGoogleLoginRedirect = async () => {
  console.log("google");
  await auth.signOut();

  googleProvider.setCustomParameters({
    prompt: 'select_account',
    hl: "ja" // 言語指定はここで行う(ja, en)
  });

  setRedirectUri("/mypage?hoge=fuga");
  signInWithRedirect(auth, googleProvider);
}

export const handleAppleLoginRedirect = async () => {
  console.log("apple");
  appleProvider.setCustomParameters({
    locale: "ja", // Apple用の言語指定(ja, en)
  });

  setRedirectUri("/mypage?hoge=fuga");
  signInWithRedirect(auth, appleProvider);
}

export const handleLogoutAccount = async (router: AppRouterInstance, toaster: CreateToasterReturn) => {
  try {
    await auth.signOut().then(() => {
      signOutWithNextAuth({ callbackUrl: '/' });
    });

  } catch (error) {
      toaster.create({
      title: 'エラー',
      description: 'ログアウトに失敗しました'+error,
      duration: 5000,
    });
  }
}

// ------------------------------
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
