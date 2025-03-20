import { useState } from 'react';
import styles from './ExportPanel.module.css';
import { useBlockStore } from '../../store/useBlockStore';
import html2canvas from 'html2canvas';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

interface ExportPanelProps {
  sceneRef: React.RefObject<any>;
}

export const ExportPanel = ({ sceneRef }: ExportPanelProps) => {
  const { activeProject } = useBlockStore();
  const [showPanel, setShowPanel] = useState(false);
  const [exporting, setExporting] = useState(false);

  // パネルの表示/非表示を切り替え
  const togglePanel = () => {
    setShowPanel(!showPanel);
  };

  // スクリーンショットを撮影
  const takeScreenshot = async () => {
    try {
      setExporting(true);
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        throw new Error('キャンバスが見つかりません');
      }

      const screenshot = await html2canvas(canvas);
      
      // スクリーンショットを新しいタブで開く
      const imgData = screenshot.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${activeProject?.name || 'screenshot'}.png`;
      link.click();
      
      setExporting(false);
    } catch (error) {
      console.error('スクリーンショットの撮影に失敗しました:', error);
      setExporting(false);
      alert('スクリーンショットの撮影に失敗しました');
    }
  };

  // 3Dモデルをエクスポート (GLB形式)
  const exportToGLB = () => {
    if (!sceneRef.current) {
      alert('シーンが読み込まれていません');
      return;
    }

    try {
      setExporting(true);
      const exporter = new GLTFExporter();
      
      exporter.parse(
        sceneRef.current,
        (gltf) => {
          // バイナリデータとしてエクスポート
          if (gltf instanceof ArrayBuffer) {
            saveArrayBuffer(gltf, `${activeProject?.name || 'model'}.glb`);
          } else {
            // JSON形式の場合
            const output = JSON.stringify(gltf, null, 2);
            saveString(output, `${activeProject?.name || 'model'}.gltf`);
          }
          setExporting(false);
        },
        (error) => {
          console.error('GLTFエクスポートエラー:', error);
          setExporting(false);
          alert('3Dモデルのエクスポートに失敗しました');
        },
        { binary: true } // GLB形式でエクスポート
      );
    } catch (error) {
      console.error('GLTFエクスポートエラー:', error);
      setExporting(false);
      alert('3Dモデルのエクスポートに失敗しました');
    }
  };

  // 3Dモデルをエクスポート (STL形式)
  const exportToSTL = () => {
    if (!sceneRef.current) {
      alert('シーンが読み込まれていません');
      return;
    }

    try {
      setExporting(true);
      const exporter = new STLExporter();
      const result = exporter.parse(sceneRef.current);
      saveString(result, `${activeProject?.name || 'model'}.stl`);
      setExporting(false);
    } catch (error) {
      console.error('STLエクスポートエラー:', error);
      setExporting(false);
      alert('3Dモデルのエクスポートに失敗しました');
    }
  };

  // 3Dモデルをエクスポート (OBJ形式)
  const exportToOBJ = () => {
    if (!sceneRef.current) {
      alert('シーンが読み込まれていません');
      return;
    }

    try {
      setExporting(true);
      const exporter = new OBJExporter();
      const result = exporter.parse(sceneRef.current);
      saveString(result, `${activeProject?.name || 'model'}.obj`);
      setExporting(false);
    } catch (error) {
      console.error('OBJエクスポートエラー:', error);
      setExporting(false);
      alert('3Dモデルのエクスポートに失敗しました');
    }
  };

  // 文字列をファイルとして保存するヘルパー関数
  const saveString = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename || 'download.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ArrayBufferをファイルとして保存するヘルパー関数
  const saveArrayBuffer = (buffer: ArrayBuffer, filename: string) => {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className={styles.exportContainer}>
      <button 
        className={styles.toggleButton}
        onClick={togglePanel}
      >
        {showPanel ? '✖' : '📷'}
      </button>
      
      {showPanel && (
        <div className={styles.panel}>
          <h3 className={styles.title}>エクスポート</h3>
          
          <div className={styles.buttonGroup}>
            <button 
              className={styles.exportButton}
              onClick={takeScreenshot}
              disabled={exporting}
            >
              📷 スクリーンショット
            </button>
            
            <button 
              className={styles.exportButton}
              onClick={exportToGLB}
              disabled={exporting}
            >
              📦 GLB形式
            </button>
            
            <button 
              className={styles.exportButton}
              onClick={exportToSTL}
              disabled={exporting}
            >
              🧩 STL形式
            </button>
            
            <button 
              className={styles.exportButton}
              onClick={exportToOBJ}
              disabled={exporting}
            >
              🔢 OBJ形式
            </button>
          </div>
          
          {exporting && (
            <div className={styles.loadingIndicator}>
              <span>エクスポート中...</span>
            </div>
          )}
          
          <div className={styles.info}>
            <p>GLB: Unity, Blender等で使用可能</p>
            <p>STL: 3Dプリント用</p>
            <p>OBJ: 一般的な3Dモデル形式</p>
          </div>
        </div>
      )}
    </div>
  );
}; 