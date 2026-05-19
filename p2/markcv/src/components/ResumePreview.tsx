import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { ThemeType, StyleSettings } from '../types';
import { THEMES } from '../constants';

interface ResumePreviewProps {
  markdown: string;
  theme: ThemeType;
  styleSettings: StyleSettings;
  scale: number;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ markdown, theme, styleSettings, scale }) => {
  const themeConfig = THEMES[theme];

  return (
    <div 
      className="resume-preview overflow-auto p-4 flex justify-center"
      style={{ backgroundColor: themeConfig.background }}
    >
      <div 
        id="resume-content"
        className="a4-paper"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          fontSize: `${styleSettings.fontSize}px`,
          lineHeight: styleSettings.lineHeight,
          fontFamily: styleSettings.fontFamily
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => (
              <h1 style={{ color: themeConfig.primary, borderColor: themeConfig.primary }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 style={{ color: themeConfig.secondary }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 style={{ color: themeConfig.secondary }}>
                {children}
              </h3>
            ),
            strong: ({ children }) => (
              <strong style={{ color: themeConfig.primary }}>
                {children}
              </strong>
            ),
            a: ({ children, href }) => (
              <a href={href} style={{ color: themeConfig.accent }} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            )
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ResumePreview;
