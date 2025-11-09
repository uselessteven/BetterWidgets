const assert = require("node:assert");

function main() {
  try {
    const { createClient } = require("@supabase/supabase-js/dist/main/index.js");

    assert.strictEqual(
      typeof createClient,
      "function",
      "createClient debe estar definido en el build CommonJS de Supabase"
    );

    const client = createClient("https://example.supabase.co", "test-key", {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    assert.ok(client, "El cliente de Supabase debería instanciarse sin errores.");

    console.log("[test] Supabase CommonJS build cargado correctamente.");
  } catch (error) {
    console.error("[test] Error al cargar el build CommonJS de Supabase:", error);
    process.exitCode = 1;
  }
}

main();

