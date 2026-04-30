import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ContactFormCopy } from "@/types/portfolio";

vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({
    onSuccess,
    onError,
    onExpire
  }: {
    onSuccess: (token: string) => void;
    onError: (code: string) => void;
    onExpire: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => onSuccess("token-test")}>
        mock-turnstile-success
      </button>
      <button type="button" onClick={() => onError("110200")}>
        mock-turnstile-error-domain
      </button>
      <button type="button" onClick={() => onError("200000")}>
        mock-turnstile-error-generic
      </button>
      <button type="button" onClick={onExpire}>
        mock-turnstile-expire
      </button>
    </div>
  ),
}));

const copy: ContactFormCopy = {
  formAriaLabel: "Formulario de contacto",
  nameLabel: "Nombre",
  emailLabel: "Email",
  messageLabel: "Mensaje",
  sendLabel: "Enviar",
  sendingLabel: "Enviando",
  newMessageLabel: "Nuevo mensaje",
  successMessage: "Enviado",
  errorGeneric: "Error",
  errorConfig: "Config error",
  nameRequired: "Nombre requerido",
  nameMax: "Nombre largo",
  emailInvalid: "Email inválido",
  messageMin: "Mensaje corto",
  messageMax: "Mensaje largo",
  honeypotLabel: "Empresa",
  errorTurnstileRequired: "Completa captcha",
  errorTurnstile: "Captcha inválido",
  errorTurnstileDomain: "Dominio no autorizado"
};

describe("ContactForm", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        json: async () => ({ ok: true })
      })
    );
  });

  async function loadForm() {
    const { ContactForm } = await import("./ContactForm");
    render(<ContactForm copy={copy} />);
  }

  function fillValidFields() {
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ana@mail.com" } });
    fireEvent.change(screen.getByLabelText("Mensaje"), {
      target: { value: "Mensaje de prueba suficientemente largo" },
    });
  }

  it("muestra validaciones de cliente y limpia el error al editar", async () => {
    await loadForm();
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Nombre requerido")).toBeInTheDocument();
    expect(screen.getByText("Email inválido")).toBeInTheDocument();
    expect(screen.getByText("Mensaje corto")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ana@mail.com" } });
    fireEvent.change(screen.getByLabelText("Mensaje"), {
      target: { value: "Mensaje de prueba suficientemente largo" },
    });
    await waitFor(() => {
      expect(screen.queryByText("Nombre requerido")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("Email inválido")).not.toBeInTheDocument();
    expect(screen.queryByText("Mensaje corto")).not.toBeInTheDocument();
  });

  it("muestra error si el mensaje es demasiado corto", async () => {
    await loadForm();
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ana@mail.com" } });
    fireEvent.change(screen.getByLabelText("Mensaje"), { target: { value: "hola" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByText("Mensaje corto")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("muestra error cuando falta token turnstile", async () => {
    await loadForm();
    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Completa captcha")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("envia el formulario cuando turnstile y payload son validos", async () => {
    await loadForm();
    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-success" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() => {
      expect(screen.getByText("Enviado")).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Nuevo mensaje" })).toBeInTheDocument();
  });

  it("vuelve a estado idle al pulsar nuevo mensaje", async () => {
    await loadForm();
    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-success" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByText("Enviado")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Nuevo mensaje" }));
    await waitFor(() => {
      expect(screen.queryByText("Enviado")).not.toBeInTheDocument();
    });
  });

  it("mapea errores de validacion del backend por campo", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 400,
        json: async () => ({
          error: "validation",
          fieldErrors: {
            email: "email_invalid",
            message: "message_min",
          },
        }),
      })
    );
    await loadForm();
    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-success" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Email inválido")).toBeInTheDocument();
    expect(screen.getByText("Mensaje corto")).toBeInTheDocument();
  });

  it("muestra error de captcha cuando backend devuelve 403 turnstile", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 403,
        json: async () => ({ error: "turnstile" }),
      })
    );
    await loadForm();
    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-success" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Captcha inválido")).toBeInTheDocument();
  });

  it("muestra error de configuracion cuando backend devuelve 503 config", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 503,
        json: async () => ({ error: "config" }),
      })
    );
    await loadForm();
    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-success" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Config error")).toBeInTheDocument();
  });

  it("muestra error requerido de turnstile cuando backend responde 400 required", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 400,
        json: async () => ({ error: "turnstile", code: "required" }),
      })
    );
    await loadForm();
    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-success" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Completa captcha")).toBeInTheDocument();
  });

  it("muestra error generico cuando backend responde no contemplado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 418,
        json: async () => ({ error: "teapot" }),
      })
    );
    await loadForm();
    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-success" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Error")).toBeInTheDocument();
  });

  it("muestra error generico cuando fetch lanza excepcion", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await loadForm();
    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-success" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Error")).toBeInTheDocument();
  });

  it("mapea name_max y message_max desde errores del backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 400,
        json: async () => ({
          error: "validation",
          fieldErrors: {
            name: "name_max",
            message: "message_max",
          },
        }),
      })
    );
    await loadForm();
    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-success" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Nombre largo")).toBeInTheDocument();
    expect(screen.getByText("Mensaje largo")).toBeInTheDocument();
  });

  it("muestra mensaje de dominio no autorizado cuando turnstile falla con 110200", async () => {
    await loadForm();
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-error-domain" }));
    expect(await screen.findByText("Dominio no autorizado")).toBeInTheDocument();
  });

  it("muestra mensaje generico cuando turnstile falla con otro codigo", async () => {
    await loadForm();
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-error-generic" }));
    expect(await screen.findByText("Captcha inválido")).toBeInTheDocument();
  });

  it("muestra error de config si falta NEXT_PUBLIC_TURNSTILE_SITE_KEY", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    const { ContactForm } = await import("./ContactForm");
    render(<ContactForm copy={copy} />);

    expect(screen.getByText("Config error")).toBeInTheDocument();
  });

  it("muestra error de config al enviar cuando falta NEXT_PUBLIC_TURNSTILE_SITE_KEY", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    const { ContactForm } = await import("./ContactForm");
    render(<ContactForm copy={copy} />);
    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect((await screen.findAllByText("Config error")).length).toBe(2);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("permite editar honeypot y expirar token de turnstile", async () => {
    await loadForm();
    fireEvent.change(screen.getByLabelText("Empresa"), { target: { value: "bot-company" } });
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-success" }));
    fireEvent.click(screen.getByRole("button", { name: "mock-turnstile-expire" }));
    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByText("Completa captcha")).toBeInTheDocument();
  });
});
