import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { QuestionnaireList } from './pages/QuestionnaireList';
import { QuestionnaireEditor } from './pages/QuestionnaireEditor';
import { QuestionnaireFill } from './pages/QuestionnaireFill';
import { QuestionnaireStats } from './pages/QuestionnaireStats';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/" element={<QuestionnaireList />} />
          <Route path="/editor/:id" element={<QuestionnaireEditor />} />
          <Route path="/fill/:id" element={<QuestionnaireFill />} />
          <Route path="/stats/:id" element={<QuestionnaireStats />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
