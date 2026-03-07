import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Fields from './pages/Fields';
import Campaigns from './pages/Campaigns';
import Crops from './pages/Crops';
import Expenses from './pages/Expenses';
import Incomes from './pages/Incomes';
import Grain from './pages/Grain';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Machinery from './pages/Machinery';
import Personnel from './pages/Personnel';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/incomes" element={<Incomes />} />
          <Route path="/grain" element={<Grain />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/machinery" element={<Machinery />} />
          <Route path="/personnel" element={<Personnel />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
