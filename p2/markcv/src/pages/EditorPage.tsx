import React, { useState, useEffect, useMemo } from 'react';
import Toolbar from '../components/Toolbar';
import MarkdownEditor from '../components/MarkdownEditor';
import ResumePreview from '../components/ResumePreview';
import DiagnosticsPanel from '../components/DiagnosticsPanel';
import { ThemeType, StyleSettings } from '../types';
import { loadMarkdown, saveMarkdown, loadTheme, saveTheme, loadStyleSettings, saveStyleSettings } from '../utils/storage';
import { diagnoseResume } from '../utils/diagnostics';

const EditorPage: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(() => loadMarkdown());
  const [theme, setTheme] = useState<ThemeType>(() => loadTheme());
  const [styleSettings, setStyleSettings] = useState<StyleSettings>(() => loadStyleSettings());
  const [previewScale, setPreviewScale] = useState<number>(0.75);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(true);

  const diagnostics = useMemo(() => diagnoseResume(markdown), [markdown]);

  useEffect(() => {
    saveMarkdown(markdown);
  }, [markdown]);

  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveStyleSettings(styleSettings);
  }, [styleSettings]);

  const handleMarkdownChange = (value: string) => {
    setMarkdown(value);
  };

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme);
  };

  const handleStyleChange = (newSettings: StyleSettings) => {
    setStyleSettings(newSettings);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Toolbar
        theme={theme}
        onThemeChange={handleThemeChange}
        styleSettings={styleSettings}
        onStyleChange={handleStyleChange}
        previewScale={previewScale}
        onScaleChange={setPreviewScale}
        markdown={markdown}
        onMarkdownChange={handleMarkdownChange}
      />
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col border-r border-gray-200">
          <MarkdownEditor
            value={markdown}
            onChange={handleMarkdownChange}
          />
          <DiagnosticsPanel
            issues={diagnostics}
            isOpen={showDiagnostics}
            onToggle={() => setShowDiagnostics(!showDiagnostics)}
          />
        </div>
        
        <div className="w-full lg:w-1/2 h-1/2 lg:h-full overflow-hidden">
          <ResumePreview
            markdown={markdown}
            theme={theme}
            styleSettings={styleSettings}
            scale={previewScale}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
