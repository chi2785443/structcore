import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { SimplySupportedPage } from "@/routes/beams/SimplySupportedPage";
import { ContinuousBeamPage } from "@/routes/beams/ContinuousBeamPage";
import { ColumnPage } from "@/routes/columns/ColumnPage";
import { SlabPage } from "@/routes/slabs/SlabPage";
import { PadFoundationPage } from "@/routes/foundations/PadFoundationPage";
import { SettingsPage } from "@/routes/settings/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/beams/simple" replace />} />
          <Route path="beams/simple" element={<SimplySupportedPage />} />
          <Route path="beams/continuous" element={<ContinuousBeamPage />} />
          <Route path="columns" element={<ColumnPage />} />
          <Route path="slabs/one-way" element={<SlabPage type="one-way" />} />
          <Route path="slabs/two-way" element={<SlabPage type="two-way" />} />
          <Route path="slabs/flat-slab" element={<SlabPage type="flat-slab" />} />
          <Route path="foundations/pad" element={<PadFoundationPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
