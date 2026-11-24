import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const certificateDirectory = fileURLToPath(new URL("./public/certificates", import.meta.url));
const virtualCertificatesId = "virtual:portfolio-certificates";
const resolvedCertificatesId = `\0${virtualCertificatesId}`;
const supportedCertificateTypes = new Set([".png", ".jpg", ".jpeg", ".webp", ".pdf"]);

function certificateAssets() {
  function getCertificateAssets() {
    return readdirSync(certificateDirectory, { withFileTypes: true })
      .filter(file => file.isFile() && supportedCertificateTypes.has(extname(file.name).toLowerCase()))
      .map(file => {
        const extension = extname(file.name).toLowerCase();
        return {
          name: file.name,
          url: `/certificates/${encodeURIComponent(file.name).replace(/%3A/gi, ":")}`,
          type: extension === ".pdf" ? "application/pdf" : `image/${extension.slice(1).replace("jpg", "jpeg")}`
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  return {
    name: "portfolio-certificate-assets",
    resolveId(id) {
      return id === virtualCertificatesId ? resolvedCertificatesId : null;
    },
    load(id) {
      if (id === resolvedCertificatesId) {
        return `export default ${JSON.stringify(getCertificateAssets())};`;
      }
      return null;
    },
    configureServer(server) {
      server.watcher.add(certificateDirectory);
      server.watcher.on("all", (event, changedPath) => {
        if (!resolve(changedPath).startsWith(`${certificateDirectory}${sep}`)) return;
        const module = server.moduleGraph.getModuleById(resolvedCertificatesId);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: "full-reload" });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), certificateAssets()]
});
