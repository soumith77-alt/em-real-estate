# Mock files

This folder is intentionally empty in the prototype.

The application references documents by URL (e.g. `/mock-files/ld-prop-11-tenant-xyz-2009-01.pdf`). In the production build those URLs point at real objects in the document store (lease PDFs, data-room artefacts, scanned amendments, estoppels, red-flag source pages).

For the demo we render document viewers, previews and download links against these paths, but we do **not** distribute any real PDF binaries. Any links in the prototype that resolve to files under `/mock-files/` are stand-ins that would be served from the production document store.

If you need to test the "file open" flow end-to-end, drop a small placeholder PDF into this folder with the same basename the fixture uses (e.g. `ld-prop-11-tenant-xyz-2009-01.pdf`). Do **not** commit real files here.
