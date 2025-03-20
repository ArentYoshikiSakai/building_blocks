import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from './config';

// ユーザー登録
export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    let errorMessage = 'ユーザー登録に失敗しました';
    
    // Firebase認証エラーのハンドリング
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'このメールアドレスは既に使用されています';
          break;
        case 'auth/invalid-email':
          errorMessage = 'メールアドレスの形式が正しくありません';
          break;
        case 'auth/weak-password':
          errorMessage = 'パスワードは6文字以上である必要があります';
          break;
        default:
          errorMessage = `登録エラー: ${error.message}`;
      }
    }
    
    throw new Error(errorMessage);
  }
};

// ユーザーログイン
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    let errorMessage = 'ログインに失敗しました';
    
    // Firebase認証エラーのハンドリング
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'メールアドレスまたはパスワードが正しくありません';
          break;
        case 'auth/invalid-email':
          errorMessage = 'メールアドレスの形式が正しくありません';
          break;
        case 'auth/user-disabled':
          errorMessage = 'このアカウントは無効になっています';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください';
          break;
        default:
          errorMessage = `ログインエラー: ${error.message}`;
      }
    }
    
    throw new Error(errorMessage);
  }
};

// Googleログイン
export const loginWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    throw new Error(`Googleログインエラー: ${error.message}`);
  }
};

// ユーザーログアウト
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(`ログアウトエラー: ${error.message}`);
  }
};

// 現在のユーザーを取得
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// 認証状態の変更を監視
export const onAuthChanged = (callback: (user: User | null) => void): () => void => {
  return onAuthStateChanged(auth, callback);
}; 