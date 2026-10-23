import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { FlowPage } from './pages/FlowPage';
import { ListingPage } from './pages/ListingPage';
import { AboutPage } from './pages/AboutPage';
import { useFlowStore } from './store/useFlowStore';

export default function App(): JSX.Element {
  const page = useFlowStore((s) => s.page);

  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          {page === 'flow' && <FlowPage />}
          {page === 'listing' && <ListingPage />}
          {page === 'about' && <AboutPage />}
        </main>
      </div>
    </div>
  );
}
