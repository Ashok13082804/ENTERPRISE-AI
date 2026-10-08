import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LoginPage from '@/pages/LoginPage'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardHome from '@/pages/DashboardHome'
import ChatPage from '@/pages/ChatPage'
import RAGPage from '@/pages/RAGPage'
import DocumentsPage from '@/pages/DocumentsPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import MLPage from '@/pages/MLPage'
import MLVersePage from '@/pages/MLVersePage'
import VisionPage from '@/pages/VisionPage'
import BlockchainPage from '@/pages/BlockchainPage'
import NLPPage from '@/pages/NLPPage'
import ProjectsPage from '@/pages/ProjectsPage'
import TasksPage from '@/pages/TasksPage'
import SettingsPage from '@/pages/SettingsPage'
import UsersPage from '@/pages/UsersPage'
import SecurityPage from '@/pages/SecurityPage'
import CybersecurityPage from '@/pages/CybersecurityPage'
import NotificationsPage from '@/pages/NotificationsPage'
// Enterprise Modules
import HealthcarePage from '@/pages/HealthcarePage'
import LegalPage from '@/pages/LegalPage'
import RecruitmentPage from '@/pages/RecruitmentPage'
import BankingPage from '@/pages/BankingPage'
import SmartCityPage from '@/pages/SmartCityPage'
import EducationPage from '@/pages/EducationPage'
import AgriculturePage from '@/pages/AgriculturePage'
import { InsurancePage, EcommercePage, EVotingPage, DisasterPage, ForensicsPage } from '@/pages/MiscModulePages'
import ResumePortalPage from '@/pages/ResumePortalPage'
// Academic AI Modules
import MathVersePage from '@/pages/MathVersePage'
import PhysicsVersePage from '@/pages/PhysicsVersePage'
import ChemVersePage from '@/pages/ChemVersePage'
import CSVersePage from '@/pages/CSVersePage'
import BioVersePage from '@/pages/BioVersePage'
import CalcVersePage from '@/pages/CalcVersePage'
import LinguaVersePage from '@/pages/LinguaVersePage'
import NotesPage from '@/pages/NotesPage'
import NoteEditorPage from '@/pages/NoteEditorPage'
import NotesDashboardPage from '@/pages/NotesDashboardPage'
// 450+ Deep Learning Document Analysis & Subproject Platform
import DocumentAnalyzerPage from '@/pages/DocumentAnalyzerPage'
import ModuleExplorerPage from '@/pages/ModuleExplorerPage'
import SubprojectStudioPage from '@/pages/SubprojectStudioPage'
import AnalysisHistoryPage from '@/pages/AnalysisHistoryPage'
// 432 Game Development Hub
import { GameHubPage } from '@/pages/GameHubPage'
import { GameDetailPage } from '@/pages/GameDetailPage'
import { GamePlayPage } from '@/pages/GamePlayPage'
import { GameBuilderPage } from '@/pages/GameBuilderPage'
import { GameValidationPage } from '@/pages/GameValidationPage'
// AI Image Studio
import ImageStudioPage from '@/pages/ImageStudioPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="rag" element={<RAGPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="mlverse" element={<MLVersePage />} />
        <Route path="ml" element={<MLPage />} />
        <Route path="vision" element={<VisionPage />} />
        <Route path="blockchain" element={<BlockchainPage />} />
        <Route path="nlp" element={<NLPPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="cybersecurity" element={<CybersecurityPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Enterprise AI Modules */}
        <Route path="healthcare" element={<HealthcarePage />} />
        <Route path="legal" element={<LegalPage />} />
        <Route path="recruitment" element={<RecruitmentPage />} />
        <Route path="banking" element={<BankingPage />} />
        <Route path="smartcity" element={<SmartCityPage />} />
        <Route path="education" element={<EducationPage />} />
        <Route path="agriculture" element={<AgriculturePage />} />
        <Route path="insurance" element={<InsurancePage />} />
        <Route path="ecommerce" element={<EcommercePage />} />
        <Route path="evoting" element={<EVotingPage />} />
        <Route path="disaster" element={<DisasterPage />} />
        <Route path="forensics" element={<ForensicsPage />} />
        <Route path="resume-portal" element={<ResumePortalPage />} />
        {/* Academic AI Modules */}
        <Route path="mathverse" element={<MathVersePage />} />
        <Route path="physicsverse" element={<PhysicsVersePage />} />
        <Route path="chemverse" element={<ChemVersePage />} />
        <Route path="csverse" element={<CSVersePage />} />
        <Route path="bioverse" element={<BioVersePage />} />
        <Route path="calcverse" element={<CalcVersePage />} />
        <Route path="linguaverse" element={<LinguaVersePage />} />
        {/* Smart Notes */}
        <Route path="notes" element={<NotesPage />} />
        <Route path="notes/dashboard" element={<NotesDashboardPage />} />
        <Route path="notes/new" element={<NoteEditorPage />} />
        <Route path="notes/:id" element={<NoteEditorPage />} />
        <Route path="folders" element={<NotesPage />} />
        {/* 450+ Deep Learning Platform & Subproject Studio */}
        <Route path="analyzer" element={<DocumentAnalyzerPage />} />
        <Route path="dl-modules" element={<ModuleExplorerPage />} />
        <Route path="dl-subprojects" element={<SubprojectStudioPage />} />
        <Route path="dl-history" element={<AnalysisHistoryPage />} />
        {/* 432 Game Development Hub */}
        <Route path="game-hub" element={<GameHubPage />} />
        <Route path="game-hub/validation" element={<GameValidationPage />} />
        <Route path="game-hub/:gameId" element={<GameDetailPage />} />
        <Route path="game-hub/:gameId/play" element={<GamePlayPage />} />
        <Route path="game-hub/:gameId/build" element={<GameBuilderPage />} />
        {/* AI Image Studio */}
        <Route path="image-studio" element={<ImageStudioPage />} />
        <Route path="image-studio/:mode" element={<ImageStudioPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
