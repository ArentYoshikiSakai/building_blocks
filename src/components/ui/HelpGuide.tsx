import { useState } from 'react';
import styles from './HelpGuide.module.css';

export const HelpGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'基本' | '操作' | 'ヒント'>('基本');

  const toggleGuide = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.helpContainer}>
      <button 
        className={styles.helpButton}
        onClick={toggleGuide}
        aria-label="ヘルプガイドを開く"
      >
        {isOpen ? '✖' : '❓'}
      </button>
      
      {isOpen && (
        <div className={styles.helpPanel}>
          <h2 className={styles.title}>ブロックワールド ガイド</h2>
          
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === '基本' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('基本')}
            >
              基本
            </button>
            <button 
              className={`${styles.tab} ${activeTab === '操作' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('操作')}
            >
              操作方法
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'ヒント' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('ヒント')}
            >
              ヒント
            </button>
          </div>
          
          <div className={styles.content}>
            {activeTab === '基本' && (
              <div>
                <h3>はじめに</h3>
                <p>ブロックワールドへようこそ！このアプリは、3Dブロックを組み合わせて自由に創作できる積木アプリです。</p>
                
                <h3>基本的な使い方</h3>
                <ol>
                  <li>左側のパレットからブロックを選択します</li>
                  <li>ドラッグして3D空間に配置します</li>
                  <li>ブロックをクリックして選択します</li>
                  <li>画面下のツールバーを使って操作します</li>
                </ol>
                
                <h3>ブロックの種類</h3>
                <ul>
                  <li>立方体：基本的な形状</li>
                  <li>長方形：横長のブロック</li>
                  <li>円柱：丸い柱</li>
                  <li>三角形：屋根などに</li>
                  <li>アーチ：ドア上部などに</li>
                  <li>車輪：動く部品の表現に</li>
                  <li>窓：透明なガラス</li>
                  <li>ドア：入口表現に</li>
                </ul>
              </div>
            )}
            
            {activeTab === '操作' && (
              <div>
                <h3>視点の操作</h3>
                <ul>
                  <li><strong>回転：</strong>マウスの左ボタンドラッグ</li>
                  <li><strong>ズーム：</strong>マウスホイール</li>
                  <li><strong>移動：</strong>マウスの右ボタンドラッグ</li>
                </ul>
                
                <h3>ツールの使い方</h3>
                <ul>
                  <li><strong>選択：</strong>ブロックをクリックして選択</li>
                  <li><strong>移動：</strong>選択したブロックをドラッグ</li>
                  <li><strong>回転：</strong>選択したブロックをドラッグして回転</li>
                  <li><strong>サイズ変更：</strong>選択したブロックをドラッグしてサイズ変更</li>
                  <li><strong>削除：</strong>ブロックをクリックするか、選択してDeleteキーを押す</li>
                </ul>
                
                <h3>ショートカット</h3>
                <ul>
                  <li><strong>Delete / Backspace：</strong>選択したブロックを削除</li>
                  <li><strong>Shift + ドラッグ：</strong>選択モードでもサイズ変更</li>
                  <li><strong>右クリック + ドラッグ：</strong>選択モードでも回転</li>
                </ul>
              </div>
            )}
            
            {activeTab === 'ヒント' && (
              <div>
                <h3>上手な作り方のヒント</h3>
                <ul>
                  <li>地面に置くブロックから始めると安定します</li>
                  <li>グリッドスナップを使うと整列しやすいです</li>
                  <li>同じ色で統一すると美しく見えます</li>
                  <li>複雑な形は単純な形の組み合わせで作れます</li>
                  <li>窓や装飾を加えると見栄えが良くなります</li>
                </ul>
                
                <h3>作品例</h3>
                <p>こんなものが作れます：</p>
                <ul>
                  <li>家：立方体と三角形の組み合わせ</li>
                  <li>車：長方体とタイヤで</li>
                  <li>お城：塔と壁の組み合わせ</li>
                  <li>ロボット：ブロックで体を</li>
                  <li>動物：基本形の組み合わせで</li>
                </ul>
                
                <h3>困ったときは</h3>
                <p>何か問題がありましたら、このヘルプガイドをご覧ください。操作方法がわからない場合は「操作」タブをご確認ください。</p>
              </div>
            )}
          </div>
          
          <div className={styles.footer}>
            <p>ブロックワールド v1.0</p>
            <button 
              className={styles.closeButton}
              onClick={toggleGuide}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 