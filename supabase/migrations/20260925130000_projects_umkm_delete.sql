-- Lets a UMKM delete its own project (JasaDashboard's "Hapus Proyek") —
-- e.g. one that fell through. See backend/sql/schema.sql.
create policy "UMKM delete own projects" on projects for delete using (auth.uid() = umkm_id);
