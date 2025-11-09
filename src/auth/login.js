
(() => {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const form = document.getElementById("login-form");
  const submitBtn = document.getElementById("submit-btn");
  const toggleBtn = document.getElementById("toggle-mode");
  const statusMessage = document.getElementById("status-message");
  const title = document.querySelector(".login-card__title");
  const subtitle = document.querySelector(".login-card__subtitle");

  let mode = "login";

  const supabaseAuth = window.supabaseAuth;

  initialize().catch((error) => {
    console.error("Supabase initialization error:", error);
    setStatus(
      "No fue posible preparar el inicio de sesión. Reinstala la aplicación o revisa la configuración.",
      "error"
    );
    disableActions();
  });

  async function initialize() {
    if (!supabaseAuth) {
      throw new Error("SUPABASE_BRIDGE_UNAVAILABLE");
    }

    let configured = false;
    try {
      configured = await supabaseAuth.isConfigured?.();
    } catch (error) {
      console.error("Supabase configuration check failed:", error);
      configured = false;
    }

    if (!configured) {
      setStatus(
        "No fue posible conectar con el servicio de autenticación. Contacta a la persona administradora.",
        "error"
      );
      disableActions();
      return;
    }

    updateModeCopy();

    toggleBtn?.addEventListener("click", () => {
      mode = mode === "login" ? "signup" : "login";
      updateModeCopy();
    });

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!emailInput?.value || !passwordInput?.value) {
        setStatus("Completa tu correo y contraseña.", "error");
        return;
      }

      toggleLoading(true);
      setStatus(mode === "login" ? "Validando credenciales…" : "Creando cuenta…");

      try {
        if (mode === "login") {
          const result = await supabaseAuth.signInWithPassword({
            email: emailInput.value,
            password: passwordInput.value,
          });

          if (result.error) {
            throw result.error;
          }

          if (result.data?.session) {
            setStatus("Sesión iniciada. Redirigiendo…", "success");
            setTimeout(() => {
              window.electronAPI.loadPage("src/index.html");
            }, 500);
          } else {
            setStatus("No se recibió una sesión válida. Revisa tu cuenta.", "error");
            toggleLoading(false);
          }
        } else {
          const result = await supabaseAuth.signUp({
            email: emailInput.value,
            password: passwordInput.value,
          });

          if (result.error) {
            throw result.error;
          }

          if (result.data?.user) {
            setStatus(
              "Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.",
              "success"
            );
            mode = "login";
            updateModeCopy();
            toggleLoading(false);
          } else {
            setStatus(
              "La cuenta no pudo crearse en este momento. Intenta nuevamente.",
              "error"
            );
            toggleLoading(false);
          }
        }
      } catch (error) {
        console.error("Supabase auth error:", error);
        setStatus(
          error?.message ?? "Ocurrió un problema al procesar tu solicitud.",
          "error"
        );
        toggleLoading(false);
      }
    });

    await checkExistingSession();
  }

  async function checkExistingSession() {
    toggleLoading(true);
    setStatus("Comprobando sesión activa…");
    try {
      const result = await supabaseAuth.getSession();
      if (result.error) {
        throw result.error;
      }

      if (result.data?.session) {
        setStatus("Sesión encontrada. Accediendo…", "success");
        setTimeout(() => {
          window.electronAPI.loadPage("src/index.html");
        }, 350);
      } else {
        toggleLoading(false);
        setStatus("");
      }
    } catch (error) {
      console.warn("Supabase getSession warning:", error);
      toggleLoading(false);
      setStatus("");
    }
  }

  function updateModeCopy() {
    if (!submitBtn || !toggleBtn || !title || !subtitle) return;
    if (mode === "login") {
      title.textContent = "Inicia sesión";
      subtitle.textContent = "Usa tus credenciales para acceder a tus widgets.";
      submitBtn.textContent = "Entrar";
      toggleBtn.textContent = "Crear cuenta";
    } else {
      title.textContent = "Crea tu cuenta";
      subtitle.textContent = "Registra un correo y contraseña para comenzar.";
      submitBtn.textContent = "Registrarme";
      toggleBtn.textContent = "Ya tengo cuenta";
    }
    setStatus("");
    toggleLoading(false);
  }

  function toggleLoading(isLoading) {
    if (submitBtn) {
      if (mode === "signup") {
        submitBtn.textContent = isLoading ? "Creando…" : "Registrarme";
      } else {
        submitBtn.textContent = isLoading ? "Entrando…" : "Entrar";
      }
      submitBtn.disabled = isLoading;
    }
    if (toggleBtn) toggleBtn.disabled = isLoading;
  }

  function setStatus(message, type) {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.classList.remove(
      "login-form__status--error",
      "login-form__status--success"
    );
    if (type === "error") {
      statusMessage.classList.add("login-form__status--error");
    }
    if (type === "success") {
      statusMessage.classList.add("login-form__status--success");
    }
  }

  function disableActions() {
    if (submitBtn) submitBtn.disabled = true;
    if (toggleBtn) toggleBtn.disabled = true;
  }
})();